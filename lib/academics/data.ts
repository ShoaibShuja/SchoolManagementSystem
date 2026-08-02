import "server-only";

import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import type { z } from "zod";
import type { academicYearSchema, assignmentSchema, subjectSchema, termSchema, timetableSchema } from "@/lib/academics/schemas";
import type { AcademicSetup, AcademicYear, EnrollmentReview, SectionOption, Subject, TeacherAssignment, TeacherOption, Term, TimetableEntry } from "@/lib/academics/types";

type YearInput = z.infer<typeof academicYearSchema>;
type TermInput = z.infer<typeof termSchema>;
type SubjectInput = z.infer<typeof subjectSchema>;
type AssignmentInput = z.infer<typeof assignmentSchema>;
type TimetableInput = z.infer<typeof timetableSchema>;

export class AcademicError extends Error {}

function fail(error: { message: string; code?: string } | null) {
  if (!error) return;
  if (error.code === "23505") throw new AcademicError("That active code, name, or assignment already exists.");
  if (error.code === "23P01") throw new AcademicError("This period conflicts with an existing academic, term, or timetable record.");
  if (error.code === "23503") throw new AcademicError("This record is still in use and cannot be removed.");
  throw new AcademicError(error.message || "The academic record could not be saved.");
}

const displayName = (row: { first_name: string; last_name: string }) => `${row.first_name} ${row.last_name}`.trim();

function mapYear(row: { id: string; name: string; starts_on: string; ends_on: string; status: string }): AcademicYear { return { id: row.id, name: row.name, startsOn: row.starts_on, endsOn: row.ends_on, status: row.status as AcademicYear["status"] }; }
function mapSubject(row: { id: string; code: string; name: string; description: string | null; is_active: boolean }): Subject { return { id: row.id, code: row.code, name: row.name, description: row.description, isActive: row.is_active }; }

async function adminClient() { await requireRole("admin"); return createClient(); }

export async function getAcademicSetup(): Promise<AcademicSetup> {
  const supabase = await adminClient();
  const [yearsResult, termsResult, subjectsResult, teachersResult, sectionsResult, assignmentsResult, timetableResult, enrollmentsResult] = await Promise.all([
    supabase.from("academic_years").select("id, name, starts_on, ends_on, status").order("starts_on", { ascending: false }),
    supabase.from("terms").select("id, academic_year_id, name, starts_on, ends_on, status, academic_years!inner(name)").order("starts_on", { ascending: false }),
    supabase.from("subjects").select("id, code, name, description, is_active").order("name"),
    supabase.from("teachers").select("id, first_name, last_name, employee_number").eq("status", "active").order("first_name"),
    supabase.from("sections").select("id, name, classes!inner(name, display_order)").order("classes(display_order)").order("name"),
    supabase.from("teacher_assignments").select("id, teacher_id, subject_id, section_id, academic_year_id, teachers!inner(first_name, last_name), subjects!inner(name, code), sections!inner(name, classes!inner(name)), academic_years!inner(name), timetable_entries(id)").order("created_at", { ascending: false }),
    supabase.from("timetable_entries").select("id, academic_year_id, section_id, teacher_assignment_id, teacher_id, day_of_week, start_time, end_time, room, teacher_assignments!inner(subjects!inner(name, code)), teachers!inner(first_name, last_name), sections!inner(name, classes!inner(name))").order("day_of_week").order("start_time"),
    supabase.from("student_enrollments").select("id, enrolled_on, ended_on, status, students!inner(first_name, last_name, admission_number), academic_years!inner(name), sections!inner(name, classes!inner(name))").order("enrolled_on", { ascending: false }).limit(100),
  ]);
  [yearsResult.error, termsResult.error, subjectsResult.error, teachersResult.error, sectionsResult.error, assignmentsResult.error, timetableResult.error, enrollmentsResult.error].forEach(fail);
  const years = (yearsResult.data ?? []).map(mapYear);
  const terms: Term[] = (termsResult.data ?? []).map((row) => ({ id: row.id, academicYearId: row.academic_year_id, academicYearName: (row.academic_years as unknown as { name: string }).name, name: row.name, startsOn: row.starts_on, endsOn: row.ends_on, status: row.status as Term["status"] }));
  const teachers: TeacherOption[] = (teachersResult.data ?? []).map((row) => ({ id: row.id, name: displayName(row), employeeNumber: row.employee_number }));
  const sections: SectionOption[] = (sectionsResult.data ?? []).map((row) => ({ id: row.id, name: row.name, className: (row.classes as unknown as { name: string }).name }));
  const assignments: TeacherAssignment[] = (assignmentsResult.data ?? []).map((row) => {
    const teacher = row.teachers as unknown as { first_name: string; last_name: string }; const subject = row.subjects as unknown as { name: string; code: string }; const section = row.sections as unknown as { name: string; classes: { name: string } }; const year = row.academic_years as unknown as { name: string };
    return { id: row.id, teacherId: row.teacher_id, teacherName: displayName(teacher), subjectId: row.subject_id, subjectName: subject.name, subjectCode: subject.code, sectionId: row.section_id, sectionName: section.name, className: section.classes.name, academicYearId: row.academic_year_id, academicYearName: year.name, lessonCount: (row.timetable_entries as unknown as { id: string }[] | null)?.length ?? 0 };
  });
  const timetable = mapTimetable(timetableResult.data ?? []);
  const enrollments: EnrollmentReview[] = (enrollmentsResult.data ?? []).map((row) => { const student = row.students as unknown as { first_name: string; last_name: string; admission_number: string }; const year = row.academic_years as unknown as { name: string }; const section = row.sections as unknown as { name: string; classes: { name: string } }; return { id: row.id, studentName: displayName(student), admissionNumber: student.admission_number, academicYearName: year.name, sectionName: section.name, className: section.classes.name, enrolledOn: row.enrolled_on, endedOn: row.ended_on, status: row.status }; });
  return { years, terms, subjects: (subjectsResult.data ?? []).map(mapSubject), teachers, sections, assignments, timetable, enrollments };
}

function mapTimetable(rows: Record<string, unknown>[]): TimetableEntry[] {
  return rows.map((row) => { const assignment = row.teacher_assignments as { subjects: { name: string; code: string } }; const teacher = row.teachers as { first_name: string; last_name: string }; const section = row.sections as { name: string; classes: { name: string } }; return { id: String(row.id), academicYearId: String(row.academic_year_id), sectionId: String(row.section_id), sectionName: section.name, className: section.classes.name, assignmentId: String(row.teacher_assignment_id), teacherId: String(row.teacher_id), teacherName: displayName(teacher), subjectName: assignment.subjects.name, subjectCode: assignment.subjects.code, dayOfWeek: Number(row.day_of_week), startTime: String(row.start_time).slice(0, 5), endTime: String(row.end_time).slice(0, 5), room: row.room ? String(row.room) : null }; });
}

export async function createAcademicYear(values: YearInput) { const supabase = await adminClient(); const { error } = await supabase.from("academic_years").insert({ name: values.name, starts_on: values.startsOn, ends_on: values.endsOn, status: values.status }); fail(error); }
export async function updateAcademicYear(id: string, values: YearInput) { const supabase = await adminClient(); const { error } = await supabase.from("academic_years").update({ name: values.name, starts_on: values.startsOn, ends_on: values.endsOn, status: values.status }).eq("id", id); fail(error); }
export async function deleteAcademicYear(id: string) { const supabase = await adminClient(); const { error } = await supabase.from("academic_years").delete().eq("id", id); fail(error); }
export async function createTerm(values: TermInput) { const supabase = await adminClient(); const { error } = await supabase.from("terms").insert({ academic_year_id: values.academicYearId, name: values.name, starts_on: values.startsOn, ends_on: values.endsOn, status: values.status }); fail(error); }
export async function updateTerm(id: string, values: TermInput) { const supabase = await adminClient(); const { error } = await supabase.from("terms").update({ academic_year_id: values.academicYearId, name: values.name, starts_on: values.startsOn, ends_on: values.endsOn, status: values.status }).eq("id", id); fail(error); }
export async function deleteTerm(id: string) { const supabase = await adminClient(); const { error } = await supabase.from("terms").delete().eq("id", id); fail(error); }
export async function createSubject(values: SubjectInput) { const supabase = await adminClient(); const { error } = await supabase.from("subjects").insert({ code: values.code, name: values.name, description: values.description, is_active: values.isActive }); fail(error); }
export async function updateSubject(id: string, values: SubjectInput) { const supabase = await adminClient(); const { error } = await supabase.from("subjects").update({ code: values.code, name: values.name, description: values.description, is_active: values.isActive }).eq("id", id); fail(error); }
export async function deleteSubject(id: string) { const supabase = await adminClient(); const { error } = await supabase.from("subjects").delete().eq("id", id); fail(error); }
export async function createAssignment(values: AssignmentInput) { const supabase = await adminClient(); const { error } = await supabase.from("teacher_assignments").insert({ teacher_id: values.teacherId, subject_id: values.subjectId, section_id: values.sectionId, academic_year_id: values.academicYearId }); fail(error); }
export async function deleteAssignment(id: string) { const supabase = await adminClient(); const { error } = await supabase.from("teacher_assignments").delete().eq("id", id); fail(error); }
export async function createTimetableEntry(values: TimetableInput) { const supabase = await adminClient(); const { data: assignment, error: assignmentError } = await supabase.from("teacher_assignments").select("teacher_id, section_id, academic_year_id").eq("id", values.assignmentId).single(); fail(assignmentError); if (!assignment) throw new AcademicError("Choose a valid teacher assignment."); if (assignment.academic_year_id !== values.academicYearId) throw new AcademicError("Choose an assignment from the selected academic year."); const { error } = await supabase.from("timetable_entries").insert({ academic_year_id: values.academicYearId, teacher_assignment_id: values.assignmentId, teacher_id: assignment.teacher_id, section_id: assignment.section_id, day_of_week: values.dayOfWeek, start_time: values.startTime, end_time: values.endTime, room: values.room }); fail(error); }
export async function updateTimetableEntry(id: string, values: TimetableInput) { const supabase = await adminClient(); const { data: assignment, error: assignmentError } = await supabase.from("teacher_assignments").select("teacher_id, section_id, academic_year_id").eq("id", values.assignmentId).single(); fail(assignmentError); if (!assignment) throw new AcademicError("Choose a valid teacher assignment."); if (assignment.academic_year_id !== values.academicYearId) throw new AcademicError("Choose an assignment from the selected academic year."); const { error } = await supabase.from("timetable_entries").update({ academic_year_id: values.academicYearId, teacher_assignment_id: values.assignmentId, teacher_id: assignment.teacher_id, section_id: assignment.section_id, day_of_week: values.dayOfWeek, start_time: values.startTime, end_time: values.endTime, room: values.room }).eq("id", id); fail(error); }
export async function deleteTimetableEntry(id: string) { const supabase = await adminClient(); const { error } = await supabase.from("timetable_entries").delete().eq("id", id); fail(error); }

async function currentTimetableForStudent(studentId: string) {
  const supabase = await createClient();
  const { data: enrollment, error } = await supabase.from("student_enrollments").select("academic_year_id, section_id, academic_years!inner(status)").eq("student_id", studentId).eq("status", "active").eq("academic_years.status", "current").maybeSingle();
  fail(error); if (!enrollment) return [];
  const { data, error: timetableError } = await supabase.from("timetable_entries").select("id, academic_year_id, section_id, teacher_assignment_id, teacher_id, day_of_week, start_time, end_time, room, teacher_assignments!inner(subjects!inner(name, code)), teachers!inner(first_name, last_name), sections!inner(name, classes!inner(name))").eq("academic_year_id", enrollment.academic_year_id).eq("section_id", enrollment.section_id).order("day_of_week").order("start_time");
  fail(timetableError); return mapTimetable((data ?? []) as unknown as Record<string, unknown>[]);
}

export async function getTeacherAcademicWorkload() {
  const profile = await requireRole("teacher"); const supabase = await createClient();
  const { data: teacher, error } = await supabase.from("teachers").select("id").eq("profile_id", profile.id).maybeSingle(); fail(error); if (!teacher) throw new AcademicError("No teacher record is linked to this account.");
  const { data: assignmentRows, error: assignmentError } = await supabase.from("teacher_assignments").select("id, teacher_id, subject_id, section_id, academic_year_id, teachers!inner(first_name, last_name), subjects!inner(name, code), sections!inner(name, classes!inner(name)), academic_years!inner(name), timetable_entries(id)").eq("teacher_id", teacher.id).order("created_at", { ascending: false }); fail(assignmentError);
  const assignments = (assignmentRows ?? []).map((row) => { const teacherRow = row.teachers as unknown as { first_name: string; last_name: string }; const subject = row.subjects as unknown as { name: string; code: string }; const section = row.sections as unknown as { name: string; classes: { name: string } }; const year = row.academic_years as unknown as { name: string }; return { id: row.id, teacherId: row.teacher_id, teacherName: displayName(teacherRow), subjectId: row.subject_id, subjectName: subject.name, subjectCode: subject.code, sectionId: row.section_id, sectionName: section.name, className: section.classes.name, academicYearId: row.academic_year_id, academicYearName: year.name, lessonCount: (row.timetable_entries as unknown as { id: string }[] | null)?.length ?? 0 } satisfies TeacherAssignment; });
  const { data: rows, error: timetableError } = await supabase.from("timetable_entries").select("id, academic_year_id, section_id, teacher_assignment_id, teacher_id, day_of_week, start_time, end_time, room, teacher_assignments!inner(subjects!inner(name, code)), teachers!inner(first_name, last_name), sections!inner(name, classes!inner(name))").eq("teacher_id", teacher.id).order("day_of_week").order("start_time"); fail(timetableError);
  return { assignments, timetable: mapTimetable((rows ?? []) as unknown as Record<string, unknown>[]) };
}

export async function getOwnTimetable() { const profile = await requireRole("student"); const supabase = await createClient(); const { data: student, error } = await supabase.from("students").select("id, first_name, last_name").eq("profile_id", profile.id).maybeSingle(); fail(error); if (!student) throw new AcademicError("No student record is linked to this account."); return { name: displayName(student), timetable: await currentTimetableForStudent(student.id) }; }
export async function getParentTimetables() { const profile = await requireRole("parent"); const supabase = await createClient(); const { data: parent, error } = await supabase.from("parents").select("id").eq("profile_id", profile.id).maybeSingle(); fail(error); if (!parent) return []; const { data: links, error: linksError } = await supabase.from("parent_student_links").select("students!inner(id, first_name, last_name)").eq("parent_id", parent.id); fail(linksError); return Promise.all((links ?? []).map(async (link) => { const student = link.students as unknown as { id: string; first_name: string; last_name: string }; return { studentId: student.id, name: displayName(student), timetable: await currentTimetableForStudent(student.id) }; })); }
