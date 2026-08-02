import "server-only";

import { cache } from "react";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import type { AcademicYearOption, ClassListItem, PaginatedResult, SectionOption, StudentDetail, StudentListItem, TeacherListItem } from "@/lib/admin/types";
import type { z } from "zod";
import type { classFormSchema, sectionFormSchema, studentFormSchema, teacherFormSchema } from "@/lib/admin/schemas";

type StudentInput = z.infer<typeof studentFormSchema>;
type TeacherInput = z.infer<typeof teacherFormSchema>;
type ClassInput = z.infer<typeof classFormSchema>;
type SectionInput = z.infer<typeof sectionFormSchema>;
type ListOptions = { page: number; pageSize: number; query?: string; status?: string; sectionId?: string; academicYearId?: string };

export class AdminRecordError extends Error {
  constructor(message: string, public readonly code?: string) { super(message); }
}

function unwrapError(error: { message: string; code?: string } | null) {
  if (!error) return;
  if (error.code === "23505") throw new AdminRecordError("A record with that unique number or assignment already exists.", error.code);
  if (error.code === "23503") throw new AdminRecordError("This record is still in use and cannot be removed.", error.code);
  throw new AdminRecordError(error.message || "The record could not be saved.", error.code);
}

async function adminClient() {
  await requireRole("admin");
  return createClient();
}

export const getAcademicYears = cache(async (): Promise<AcademicYearOption[]> => {
  const supabase = await adminClient();
  const { data, error } = await supabase.from("academic_years").select("id, name, status").order("starts_on", { ascending: false });
  unwrapError(error);
  return (data ?? []).map((year) => ({ id: year.id, name: year.name, status: year.status as AcademicYearOption["status"] }));
});

export const getSectionOptions = cache(async (): Promise<SectionOption[]> => {
  const supabase = await adminClient();
  const { data, error } = await supabase.from("sections").select("id, name, capacity, classes!inner(id, name)").order("name");
  unwrapError(error);
  return (data ?? []).map((section) => {
    const classRecord = section.classes as unknown as { id: string; name: string };
    return { id: section.id, name: section.name, capacity: section.capacity as number, classId: classRecord.id, className: classRecord.name };
  });
});

function studentFromRow(row: Record<string, unknown>, academicYearId?: string): StudentListItem {
  const enrollments = (row.student_enrollments as Array<Record<string, unknown>> | null ?? []).filter((enrollment) => enrollment.status === "active" && (!academicYearId || enrollment.academic_year_id === academicYearId));
  const enrollment = enrollments[0];
  const sectionRecord = enrollment?.sections as Record<string, unknown> | null;
  const classRecord = sectionRecord?.classes as Record<string, unknown> | null;
  const links = row.parent_student_links as Array<Record<string, unknown>> | null ?? [];
  const primaryLink = links.find((link) => link.is_primary_contact) ?? links[0];
  const guardian = primaryLink?.parents as Record<string, unknown> | null;
  return {
    id: String(row.id), admissionNumber: String(row.admission_number), firstName: String(row.first_name), lastName: String(row.last_name), status: row.status as StudentListItem["status"], enrolledOn: String(row.enrolled_on), hasAccount: Boolean(row.profile_id),
    section: sectionRecord && classRecord ? { id: String(sectionRecord.id), name: String(sectionRecord.name), className: String(classRecord.name) } : null,
    guardian: guardian ? { id: String(guardian.id), firstName: String(guardian.first_name), lastName: String(guardian.last_name), phone: guardian.phone ? String(guardian.phone) : null, email: guardian.email ? String(guardian.email) : null, relationship: String(primaryLink?.relationship ?? "Guardian") } : null,
  };
}

export async function listStudents(options: ListOptions): Promise<PaginatedResult<StudentListItem>> {
  const supabase = await adminClient();
  const from = (options.page - 1) * options.pageSize;
  const enrollmentJoin = options.sectionId || options.academicYearId ? "!inner" : "!left";
  let query = supabase.from("students").select(`id, profile_id, admission_number, first_name, last_name, enrolled_on, status, student_enrollments${enrollmentJoin}(id, academic_year_id, section_id, status, sections!left(id, name, classes!left(id, name))), parent_student_links!left(is_primary_contact, relationship, parents!left(id, first_name, last_name, phone, email))`, { count: "exact" });
  if (options.query) {
    const term = options.query.replace(/[%,()]/g, " ");
    query = query.or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%,admission_number.ilike.%${term}%`);
  }
  if (options.status) query = query.eq("status", options.status);
  if (options.sectionId) query = query.eq("student_enrollments.section_id", options.sectionId);
  if (options.academicYearId) query = query.eq("student_enrollments.academic_year_id", options.academicYearId);
  const { data, error, count } = await query.order("first_name").order("last_name").range(from, from + options.pageSize - 1);
  unwrapError(error);
  return { items: (data ?? []).map((row) => studentFromRow(row as unknown as Record<string, unknown>, options.academicYearId)), total: count ?? 0, page: options.page, pageSize: options.pageSize };
}

export async function getStudent(id: string, academicYearId?: string): Promise<StudentDetail | null> {
  const supabase = await adminClient();
  const { data, error } = await supabase.from("students").select("id, profile_id, admission_number, first_name, last_name, date_of_birth, enrolled_on, status, student_enrollments!left(id, academic_year_id, section_id, status, sections!left(id, name, classes!left(id, name))), parent_student_links!left(is_primary_contact, relationship, parents!left(id, first_name, last_name, phone, email))").eq("id", id).maybeSingle();
  unwrapError(error);
  if (!data) return null;
  const item = studentFromRow(data as unknown as Record<string, unknown>, academicYearId);
  const enrollment = ((data.student_enrollments as Array<Record<string, unknown>> | null) ?? []).find((record) => record.status === "active" && (!academicYearId || record.academic_year_id === academicYearId));
  return { ...item, dateOfBirth: data.date_of_birth, profileId: data.profile_id, academicYearId: enrollment?.academic_year_id ? String(enrollment.academic_year_id) : null };
}

export async function createStudent(values: StudentInput) {
  const supabase = await adminClient();
  const { data: student, error: studentError } = await supabase.from("students").insert({ admission_number: values.admissionNumber, first_name: values.firstName, last_name: values.lastName, date_of_birth: values.dateOfBirth, enrolled_on: values.enrolledOn, status: values.status }).select("id").single();
  unwrapError(studentError);
  if (!student) throw new AdminRecordError("The student record could not be created.");
  const { data: guardian, error: guardianError } = await supabase.from("parents").insert({ first_name: values.guardianFirstName, last_name: values.guardianLastName, phone: values.guardianPhone, email: values.guardianEmail }).select("id").single();
  if (guardianError || !guardian) { await supabase.from("students").delete().eq("id", student.id); if (!guardianError) throw new AdminRecordError("The guardian record could not be created."); unwrapError(guardianError); }
  const { error: linkError } = await supabase.from("parent_student_links").insert({ parent_id: guardian!.id, student_id: student.id, relationship: values.guardianRelationship, is_primary_contact: true });
  if (linkError) { await supabase.from("parents").delete().eq("id", guardian!.id); await supabase.from("students").delete().eq("id", student.id); unwrapError(linkError); }
  if (values.academicYearId && values.sectionId) {
    const { error: enrollmentError } = await supabase.from("student_enrollments").insert({ student_id: student.id, academic_year_id: values.academicYearId, section_id: values.sectionId, enrolled_on: values.enrolledOn, status: "active" });
    if (enrollmentError) {
      await supabase.from("parent_student_links").delete().eq("parent_id", guardian!.id).eq("student_id", student.id);
      await supabase.from("parents").delete().eq("id", guardian!.id);
      await supabase.from("students").delete().eq("id", student.id);
      unwrapError(enrollmentError);
    }
  }
  return student.id;
}

export async function updateStudent(id: string, values: StudentInput) {
  const supabase = await adminClient();
  const { error } = await supabase.from("students").update({ admission_number: values.admissionNumber, first_name: values.firstName, last_name: values.lastName, date_of_birth: values.dateOfBirth, enrolled_on: values.enrolledOn, status: values.status }).eq("id", id);
  unwrapError(error);
  const { data: existing } = await supabase.from("parent_student_links").select("parent_id").eq("student_id", id).eq("is_primary_contact", true).maybeSingle();
  if (existing?.parent_id) {
    const { error: guardianError } = await supabase.from("parents").update({ first_name: values.guardianFirstName, last_name: values.guardianLastName, phone: values.guardianPhone, email: values.guardianEmail }).eq("id", existing.parent_id);
    unwrapError(guardianError);
    const { error: linkError } = await supabase.from("parent_student_links").update({ relationship: values.guardianRelationship }).eq("parent_id", existing.parent_id).eq("student_id", id);
    unwrapError(linkError);
  } else {
    const { data: guardian, error: guardianError } = await supabase.from("parents").insert({ first_name: values.guardianFirstName, last_name: values.guardianLastName, phone: values.guardianPhone, email: values.guardianEmail }).select("id").single();
    if (guardianError || !guardian) { if (!guardianError) throw new AdminRecordError("The guardian record could not be created."); unwrapError(guardianError); }
    const { error: linkError } = await supabase.from("parent_student_links").insert({ parent_id: guardian!.id, student_id: id, relationship: values.guardianRelationship, is_primary_contact: true });
    unwrapError(linkError);
  }
  if (values.academicYearId && values.sectionId) {
    const { error: transferError } = await supabase.rpc("transfer_student_enrollment", { requested_student_id: id, requested_academic_year_id: values.academicYearId, requested_section_id: values.sectionId, requested_enrolled_on: values.enrolledOn });
    unwrapError(transferError);
  }
}

export async function changeStudentStatus(id: string, status: StudentListItem["status"]) {
  const supabase = await adminClient();
  const { error } = await supabase.from("students").update({ status }).eq("id", id);
  unwrapError(error);
}

export async function listTeachers(options: ListOptions): Promise<PaginatedResult<TeacherListItem>> {
  const supabase = await adminClient();
  const from = (options.page - 1) * options.pageSize;
  let query = supabase.from("teachers").select("id, profile_id, employee_number, first_name, last_name, phone, email, qualification, employment_started_on, employment_ended_on, status", { count: "exact" });
  if (options.query) query = query.or(`first_name.ilike.%${options.query}%,last_name.ilike.%${options.query}%,employee_number.ilike.%${options.query}%,email.ilike.%${options.query}%`);
  if (options.status) query = query.eq("status", options.status);
  const { data, error, count } = await query.order("first_name").order("last_name").range(from, from + options.pageSize - 1);
  unwrapError(error);
  return { items: (data ?? []).map((teacher) => ({ id: teacher.id, employeeNumber: teacher.employee_number, firstName: teacher.first_name, lastName: teacher.last_name, phone: teacher.phone, email: teacher.email, qualification: teacher.qualification, employmentStartedOn: teacher.employment_started_on, employmentEndedOn: teacher.employment_ended_on, status: teacher.status as TeacherListItem["status"], hasAccount: Boolean(teacher.profile_id) })), total: count ?? 0, page: options.page, pageSize: options.pageSize };
}

export async function getTeacher(id: string): Promise<TeacherListItem | null> {
  const supabase = await adminClient();
  const { data, error } = await supabase.from("teachers").select("id, profile_id, employee_number, first_name, last_name, phone, email, qualification, employment_started_on, employment_ended_on, status").eq("id", id).maybeSingle();
  unwrapError(error);
  if (!data) return null;
  return { id: data.id, employeeNumber: data.employee_number, firstName: data.first_name, lastName: data.last_name, phone: data.phone, email: data.email, qualification: data.qualification, employmentStartedOn: data.employment_started_on, employmentEndedOn: data.employment_ended_on, status: data.status as TeacherListItem["status"], hasAccount: Boolean(data.profile_id) };
}

export async function createTeacher(values: TeacherInput) {
  const supabase = await adminClient();
  const { data, error } = await supabase.from("teachers").insert({ employee_number: values.employeeNumber, first_name: values.firstName, last_name: values.lastName, phone: values.phone, email: values.email, qualification: values.qualification, employment_started_on: values.employmentStartedOn, employment_ended_on: values.employmentEndedOn, status: values.status }).select("id").single();
  unwrapError(error); if (!data) throw new AdminRecordError("The teacher record could not be created."); return data.id;
}

export async function updateTeacher(id: string, values: TeacherInput) {
  const supabase = await adminClient();
  const { error } = await supabase.from("teachers").update({ employee_number: values.employeeNumber, first_name: values.firstName, last_name: values.lastName, phone: values.phone, email: values.email, qualification: values.qualification, employment_started_on: values.employmentStartedOn, employment_ended_on: values.employmentEndedOn, status: values.status }).eq("id", id);
  unwrapError(error);
}

export async function listClasses(academicYearId?: string): Promise<ClassListItem[]> {
  const supabase = await adminClient();
  const { data, error } = await supabase.from("classes").select("id, name, display_order, sections!left(id, name, capacity, student_enrollments!left(id, status, academic_year_id))").order("display_order");
  unwrapError(error);
  return (data ?? []).map((classRecord) => ({ id: classRecord.id, name: classRecord.name, displayOrder: classRecord.display_order, sections: ((classRecord.sections as unknown as Array<Record<string, unknown>>) ?? []).map((section) => ({ id: String(section.id), name: String(section.name), capacity: Number(section.capacity), activeEnrollmentCount: ((section.student_enrollments as Array<Record<string, unknown>> | null) ?? []).filter((enrollment) => enrollment.status === "active" && (!academicYearId || enrollment.academic_year_id === academicYearId)).length })) }));
}

export async function createClass(values: ClassInput) { const supabase = await adminClient(); const { error } = await supabase.from("classes").insert({ name: values.name, display_order: values.displayOrder }); unwrapError(error); }
export async function updateClass(id: string, values: ClassInput) { const supabase = await adminClient(); const { error } = await supabase.from("classes").update({ name: values.name, display_order: values.displayOrder }).eq("id", id); unwrapError(error); }
export async function deleteClass(id: string) { const supabase = await adminClient(); const { error } = await supabase.from("classes").delete().eq("id", id); unwrapError(error); }
export async function createSection(values: SectionInput) { const supabase = await adminClient(); const { error } = await supabase.from("sections").insert({ class_id: values.classId, name: values.name, capacity: values.capacity }); unwrapError(error); }
export async function updateSection(id: string, values: SectionInput) { const supabase = await adminClient(); const { error } = await supabase.from("sections").update({ class_id: values.classId, name: values.name, capacity: values.capacity }).eq("id", id); unwrapError(error); }
export async function deleteSection(id: string) { const supabase = await adminClient(); const { error } = await supabase.from("sections").delete().eq("id", id); unwrapError(error); }

export async function getAdminDashboard() {
  const supabase = await adminClient();
  const [students, teachers, classes, sections, academicYear] = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("teachers").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("classes").select("id", { count: "exact", head: true }),
    supabase.from("sections").select("id", { count: "exact", head: true }),
    supabase.from("academic_years").select("id, name").eq("status", "current").maybeSingle(),
  ]);
  [students.error, teachers.error, classes.error, sections.error, academicYear.error].forEach(unwrapError);
  let attendance: { marked: number; total: number } | null = null;
  if (academicYear.data) {
    const today = new Date().toISOString().slice(0, 10);
    const [marked, enrolled] = await Promise.all([
      supabase.from("attendance_records").select("id", { count: "exact", head: true }).eq("academic_year_id", academicYear.data.id).eq("attendance_date", today),
      supabase.from("student_enrollments").select("id", { count: "exact", head: true }).eq("academic_year_id", academicYear.data.id).eq("status", "active"),
    ]);
    [marked.error, enrolled.error].forEach(unwrapError);
    attendance = { marked: marked.count ?? 0, total: enrolled.count ?? 0 };
  }
  return { activeStudents: students.count ?? 0, activeTeachers: teachers.count ?? 0, classes: classes.count ?? 0, sections: sections.count ?? 0, academicYear: academicYear.data?.name ?? null, attendance };
}
