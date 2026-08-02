import "server-only";

import { requireCurrentProfile, requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { type AttendanceRecord, type AttendanceRosterStudent, type AttendanceSection, type AttendanceStatus, type AttendanceSummary, type ParentChildAttendance, type PersonalAttendance } from "@/lib/attendance/types";
import { buildAttendanceSummary } from "@/lib/attendance/utils";
import type { z } from "zod";
import type { attendanceQuerySchema, attendanceSaveSchema } from "@/lib/attendance/schemas";

type SaveInput = z.infer<typeof attendanceSaveSchema>;
type QueryInput = z.infer<typeof attendanceQuerySchema>;

function fail(error: { message: string; code?: string } | null) { if (error) throw new Error(error.code === "23505" ? "Attendance for this student has already been saved." : error.message); }
function displayName(row: { first_name: string; last_name: string }) { return `${row.first_name} ${row.last_name}`.trim(); }

export async function getTeacherSections(): Promise<AttendanceSection[]> {
  const profile = await requireRole("teacher"); const supabase = await createClient();
  const { data: teacher, error: teacherError } = await supabase.from("teachers").select("id").eq("profile_id", profile.id).maybeSingle(); fail(teacherError); if (!teacher) return [];
  const { data, error } = await supabase.from("teacher_assignments").select("section_id, academic_year_id, sections!inner(id, name, classes!inner(name)), academic_years!inner(id, name, status)").eq("teacher_id", teacher.id).eq("academic_years.status", "current"); fail(error);
  const unique = new Map<string, AttendanceSection>();
  (data ?? []).forEach((assignment) => { const section = assignment.sections as unknown as { id: string; name: string; classes: { name: string } }; const year = assignment.academic_years as unknown as { id: string; name: string }; unique.set(`${section.id}:${year.id}`, { id: section.id, name: section.name, className: section.classes.name, academicYearId: year.id, academicYearName: year.name }); });
  return [...unique.values()].sort((a, b) => `${a.className} ${a.name}`.localeCompare(`${b.className} ${b.name}`));
}

export async function getTeacherRoster(sectionId: string, academicYearId: string, date: string): Promise<AttendanceRosterStudent[]> {
  const sections = await getTeacherSections(); if (!sections.some((section) => section.id === sectionId && section.academicYearId === academicYearId)) throw new Error("You are not assigned to this section.");
  return loadRoster(sectionId, academicYearId, date);
}

async function loadRoster(sectionId: string, academicYearId: string, date: string): Promise<AttendanceRosterStudent[]> {
  const supabase = await createClient();
  const [enrollments, existing] = await Promise.all([
    supabase.from("student_enrollments").select("student_id, students!inner(id, first_name, last_name, admission_number)").eq("section_id", sectionId).eq("academic_year_id", academicYearId).eq("status", "active").lte("enrolled_on", date).or(`ended_on.is.null,ended_on.gte.${date}`),
    supabase.from("attendance_records").select("student_id, status, remarks").eq("section_id", sectionId).eq("academic_year_id", academicYearId).eq("attendance_date", date),
  ]);
  fail(enrollments.error); fail(existing.error); const existingByStudent = new Map((existing.data ?? []).map((record) => [record.student_id, record]));
  return (enrollments.data ?? []).map((enrollment) => { const student = enrollment.students as unknown as { id: string; first_name: string; last_name: string; admission_number: string }; const record = existingByStudent.get(student.id); return { id: student.id, name: displayName(student), admissionNumber: student.admission_number, status: (record?.status ?? "present") as AttendanceStatus, remarks: record?.remarks ?? "", existing: Boolean(record) }; }).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getAdminRoster(sectionId: string, academicYearId: string, date: string) { await requireRole("admin"); return loadRoster(sectionId, academicYearId, date); }

export async function saveTeacherAttendance(input: SaveInput) {
  const profile = await requireCurrentProfile(); if (profile.role === "teacher") await getTeacherRoster(input.sectionId, input.academicYearId, input.date); else if (profile.role !== "admin") throw new Error("You do not have permission to save attendance.");
  const supabase = await createClient(); const { data, error } = await supabase.rpc("save_section_attendance", { requested_section_id: input.sectionId, requested_academic_year_id: input.academicYearId, requested_date: input.date, requested_records: input.records.map((record) => ({ student_id: record.studentId, status: record.status, remarks: record.remarks })) }); fail(error); return data as number;
}

function attendanceFromRow(row: Record<string, unknown>, names: Map<string, string>): AttendanceRecord {
  const student = row.students as { id: string; first_name: string; last_name: string; admission_number: string }; const section = row.sections as { name: string; classes: { name: string } }; const year = row.academic_years as { name: string };
  return { id: String(row.id), studentId: student.id, studentName: displayName(student), admissionNumber: student.admission_number, sectionName: section.name, className: section.classes.name, academicYearName: year.name, date: String(row.attendance_date), status: row.status as AttendanceStatus, remarks: row.remarks ? String(row.remarks) : null, markedBy: names.get(String(row.marked_by)) ?? "School staff" };
}

export async function getAdminAttendance(query: QueryInput): Promise<{ records: AttendanceRecord[]; summary: AttendanceSummary }> {
  await requireRole("admin"); const supabase = await createClient(); let request = supabase.from("attendance_records").select("id, student_id, section_id, academic_year_id, attendance_date, status, remarks, marked_by, students!inner(id, first_name, last_name, admission_number), sections!inner(name, classes!inner(name)), academic_years!inner(name)").order("attendance_date", { ascending: false }).limit(100);
  if (query.date) request = request.eq("attendance_date", query.date); if (query.sectionId) request = request.eq("section_id", query.sectionId); if (query.studentId) request = request.eq("student_id", query.studentId); if (query.status) request = request.eq("status", query.status); if (query.academicYearId) request = request.eq("academic_year_id", query.academicYearId);
  const { data, error } = await request; fail(error); const rows = (data ?? []) as unknown as Record<string, unknown>[]; const markerIds = [...new Set(rows.map((row) => String(row.marked_by)))]; const { data: profiles, error: profilesError } = markerIds.length ? await supabase.from("profiles").select("id, first_name, last_name").in("id", markerIds) : { data: [], error: null }; fail(profilesError); const names = new Map((profiles ?? []).map((profile) => [profile.id, displayName(profile)])); const records = rows.map((row) => attendanceFromRow(row, names)); return { records, summary: buildAttendanceSummary(records.map((record) => record.status)) };
}

async function getStudentIdentity(profileId: string) { const supabase = await createClient(); const { data, error } = await supabase.from("students").select("id, first_name, last_name, admission_number").eq("profile_id", profileId).maybeSingle(); fail(error); return data; }
async function getStudentAttendance(studentId: string): Promise<PersonalAttendance> {
  const supabase = await createClient(); const [studentResult, recordsResult, enrollmentResult] = await Promise.all([
    supabase.from("students").select("first_name, last_name").eq("id", studentId).single(),
    supabase.from("attendance_records").select("id, student_id, attendance_date, status, remarks, marked_by, students!inner(id, first_name, last_name, admission_number), sections!inner(name, classes!inner(name)), academic_years!inner(name)").eq("student_id", studentId).order("attendance_date", { ascending: false }).limit(10),
    supabase.from("student_enrollments").select("sections!inner(name, classes!inner(name)), academic_years!inner(status)").eq("student_id", studentId).eq("status", "active").eq("academic_years.status", "current").maybeSingle(),
  ]); fail(studentResult.error); fail(recordsResult.error); fail(enrollmentResult.error); const rows = (recordsResult.data ?? []) as unknown as Record<string, unknown>[]; const markerIds = [...new Set(rows.map((row) => String(row.marked_by)))]; const { data: profiles } = markerIds.length ? await supabase.from("profiles").select("id, first_name, last_name").in("id", markerIds) : { data: [] }; const names = new Map((profiles ?? []).map((profile) => [profile.id, displayName(profile)])); const records = rows.map((row) => attendanceFromRow(row, names)); const student = studentResult.data!; const enrollment = enrollmentResult.data?.sections as unknown as { name: string; classes: { name: string } } | null; return { studentName: displayName(student), section: enrollment ? `${enrollment.classes.name} · ${enrollment.name}` : null, summary: buildAttendanceSummary(records.map((record) => record.status)), recent: records };
}

export async function getOwnAttendance() { const profile = await requireRole("student"); const student = await getStudentIdentity(profile.id); if (!student) throw new Error("No student record is linked to this account."); return getStudentAttendance(student.id); }
export async function getParentAttendance(): Promise<ParentChildAttendance[]> { const profile = await requireRole("parent"); const supabase = await createClient(); const { data: parent, error } = await supabase.from("parents").select("id").eq("profile_id", profile.id).maybeSingle(); fail(error); if (!parent) return []; const { data: links, error: linksError } = await supabase.from("parent_student_links").select("student_id").eq("parent_id", parent.id); fail(linksError); return Promise.all((links ?? []).map(async (link) => ({ studentId: link.student_id, ...(await getStudentAttendance(link.student_id)) })));
}

export async function getTeacherDashboard() { const sections = await getTeacherSections(); const today = new Date().toISOString().slice(0, 10); const rosters = await Promise.all(sections.map(async (section) => ({ section, roster: await getTeacherRoster(section.id, section.academicYearId, today) }))); return { sections, todayTasks: rosters.map(({ section, roster }) => ({ section, total: roster.length, marked: roster.filter((student) => student.existing).length })) }; }
