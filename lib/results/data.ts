import "server-only";

import { requireCurrentProfile, requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { calculateReport, type GradeInput } from "@/lib/results/calculations";
import type { z } from "zod";
import type { examSchema, examSubjectSchema, gradeSaveSchema } from "@/lib/results/schemas";
import type { ExamItem, ExamSetup, ExamSubjectItem, Gradebook, GradebookRow, StudentResult, StudentResultBundle } from "@/lib/results/types";

type ExamInput = z.infer<typeof examSchema>; type ExamSubjectInput = z.infer<typeof examSubjectSchema>; type GradeSaveInput = z.infer<typeof gradeSaveSchema>;
export class ResultError extends Error {}
function fail(error: { message: string; code?: string } | null) { if (!error) return; if (error.code === "23505") throw new ResultError("That exam, subject, or grade already exists."); if (error.code === "23503") throw new ResultError("This record is still in use and cannot be removed."); throw new ResultError(error.message || "The result record could not be saved."); }
const name = (row: { first_name: string; last_name: string }) => `${row.first_name} ${row.last_name}`.trim();
const asNumber = (value: number | string | null) => value === null ? null : Number(value);

async function adminClient() { await requireRole("admin"); return createClient(); }

function mapExamSubject(row: Record<string, unknown>): ExamSubjectItem { const exam = row.exams as { id: string; name: string; status: string }; const section = row.sections as { id: string; name: string; classes: { name: string } }; const subject = row.subjects as { id: string; name: string; code: string }; return { id: String(row.id), examId: exam.id, examName: exam.name, status: exam.status as ExamSubjectItem["status"], sectionId: section.id, sectionName: section.name, className: section.classes.name, subjectId: subject.id, subjectName: subject.name, subjectCode: subject.code, examDate: String(row.exam_date), maximumMarks: Number(row.maximum_marks), passingMarks: asNumber(row.passing_marks as number | string | null), gradeCount: (row.grade_entries as { id: string }[] | null)?.length ?? 0 }; }

export async function getExamSetup(): Promise<ExamSetup> {
  const supabase = await adminClient();
  const [termsResult, subjectsResult, sectionsResult, examsResult, subjectsForExamResult] = await Promise.all([
    supabase.from("terms").select("id, name, academic_year_id, academic_years!inner(name)").order("starts_on", { ascending: false }),
    supabase.from("subjects").select("id, name, code").eq("is_active", true).order("name"),
    supabase.from("sections").select("id, name, classes!inner(name, display_order)").order("classes(display_order)").order("name"),
    supabase.from("exams").select("id, name, term_id, starts_on, ends_on, status, terms!inner(academic_year_id, name, academic_years!inner(name)), exam_subjects(id)").order("starts_on", { ascending: false }),
    supabase.from("exam_subjects").select("id, exam_date, maximum_marks, passing_marks, exams!inner(id, name, status), sections!inner(id, name, classes!inner(name)), subjects!inner(id, name, code), grade_entries(id)").order("exam_date", { ascending: false }),
  ]);
  [termsResult.error, subjectsResult.error, sectionsResult.error, examsResult.error, subjectsForExamResult.error].forEach(fail);
  const exams: ExamItem[] = (examsResult.data ?? []).map((row) => { const term = row.terms as unknown as { academic_year_id: string; name: string; academic_years: { name: string } }; return { id: row.id, name: row.name, termId: row.term_id, termName: term.name, academicYearId: term.academic_year_id, academicYearName: term.academic_years.name, startsOn: row.starts_on, endsOn: row.ends_on, status: row.status as ExamItem["status"], subjectCount: (row.exam_subjects as unknown as { id: string }[] | null)?.length ?? 0 }; });
  return { terms: (termsResult.data ?? []).map((row) => ({ id: row.id, name: row.name, academicYearId: row.academic_year_id, academicYearName: (row.academic_years as unknown as { name: string }).name })), subjects: (subjectsResult.data ?? []).map((row) => ({ id: row.id, name: row.name, code: row.code })), sections: (sectionsResult.data ?? []).map((row) => ({ id: row.id, name: row.name, className: (row.classes as unknown as { name: string }).name })), exams, examSubjects: (subjectsForExamResult.data ?? []).map((row) => mapExamSubject(row as unknown as Record<string, unknown>)) };
}

export async function createExam(values: ExamInput) { const supabase = await adminClient(); const { error } = await supabase.from("exams").insert({ name: values.name, term_id: values.termId, starts_on: values.startsOn, ends_on: values.endsOn, status: values.status }); fail(error); }
export async function createExamSubject(values: ExamSubjectInput) { const supabase = await adminClient(); const { error } = await supabase.from("exam_subjects").insert({ exam_id: values.examId, section_id: values.sectionId, subject_id: values.subjectId, exam_date: values.examDate, maximum_marks: values.maximumMarks, passing_marks: values.passingMarks }); fail(error); }
export async function publishExam(id: string) { const supabase = await adminClient(); const { error } = await supabase.rpc("publish_exam", { requested_exam_id: id }); fail(error); }

export async function getTeacherGradebooks() {
  await requireRole("teacher"); const supabase = await createClient();
  const { data, error } = await supabase.from("exam_subjects").select("id, exam_date, maximum_marks, passing_marks, exams!inner(id, name, status), sections!inner(id, name, classes!inner(name)), subjects!inner(id, name, code), grade_entries(id)").order("exam_date", { ascending: false }); fail(error);
  return (data ?? []).map((row) => mapExamSubject(row as unknown as Record<string, unknown>));
}

export async function getTeacherGradebook(examSubjectId: string): Promise<Gradebook> {
  await requireRole("teacher"); const supabase = await createClient();
  const { data: subject, error: subjectError } = await supabase.from("exam_subjects").select("id, exam_date, maximum_marks, passing_marks, exams!inner(id, name, status, terms!inner(academic_year_id)), sections!inner(id, name, classes!inner(name)), subjects!inner(id, name, code), grade_entries(id)").eq("id", examSubjectId).maybeSingle(); fail(subjectError); if (!subject) throw new ResultError("This gradebook is not assigned to you.");
  const raw = subject as unknown as Record<string, unknown>; const item = mapExamSubject(raw); const exam = raw.exams as { status: string; terms: { academic_year_id: string } }; const section = raw.sections as { id: string };
  const [enrollmentResult, gradesResult] = await Promise.all([
    supabase.from("student_enrollments").select("student_id, students!inner(first_name, last_name, admission_number)").eq("section_id", section.id).eq("academic_year_id", exam.terms.academic_year_id).in("status", ["active", "completed", "transferred"]).order("students(first_name)"),
    supabase.from("grade_entries").select("student_id, marks, status, remarks, marked_by, updated_at, profiles!left(first_name, last_name)").eq("exam_subject_id", examSubjectId),
  ]); fail(enrollmentResult.error); fail(gradesResult.error);
  const gradeByStudent = new Map((gradesResult.data ?? []).map((row) => [row.student_id, row]));
  const rows: GradebookRow[] = (enrollmentResult.data ?? []).map((enrollment) => { const student = enrollment.students as unknown as { first_name: string; last_name: string; admission_number: string }; const grade = gradeByStudent.get(enrollment.student_id); const profile = grade?.profiles as unknown as { first_name: string; last_name: string } | null; return { studentId: enrollment.student_id, studentName: name(student), admissionNumber: student.admission_number, marks: asNumber(grade?.marks ?? null), status: grade?.status as GradebookRow["status"] ?? null, remarks: grade?.remarks ?? "", updatedBy: profile ? name(profile) : null, updatedAt: grade?.updated_at ?? null }; });
  return { examSubject: item, rows, canEdit: item.status === "draft" || item.status === "open" };
}

export async function saveTeacherGrades(examSubjectId: string, values: GradeSaveInput) { await requireRole("teacher"); const gradebook = await getTeacherGradebook(examSubjectId); if (!gradebook.canEdit) throw new ResultError("Published or closed results cannot be changed."); for (const record of values.records) if (record.marks !== null && record.marks > gradebook.examSubject.maximumMarks) throw new ResultError(`Marks cannot exceed ${gradebook.examSubject.maximumMarks}.`); const supabase = await createClient(); const { error } = await supabase.rpc("save_exam_grades", { requested_exam_subject_id: examSubjectId, requested_records: values.records.map((record) => ({ student_id: record.studentId, marks: record.marks, status: record.status, remarks: record.remarks })) }); fail(error); }

function buildStudentResult(exam: { id: string; name: string; status: string; terms: { name: string; academic_year_id: string; academic_years: { name: string } } }, rows: Record<string, unknown>[], attendanceRows: { status: string }[]): StudentResult {
  const first = rows[0]; const section = first.sections as { name: string; classes: { name: string } }; const reportInputs: GradeInput[] = rows.map((row) => { const subject = row.subjects as { name: string; code: string }; const grade = row.grade_entries as { marks: number | string | null; status: "graded" | "absent" | "exempt" }[] | null; const current = grade?.[0]; return { subjectName: subject.name, subjectCode: subject.code, maximumMarks: Number(row.maximum_marks), passingMarks: asNumber(row.passing_marks as number | string | null), marks: asNumber(current?.marks ?? null), status: current?.status ?? null }; }); const present = attendanceRows.filter((row) => row.status !== "absent").length; return { examId: exam.id, examName: exam.name, termName: exam.terms.name, academicYearName: exam.terms.academic_years.name, className: section.classes.name, sectionName: section.name, publishedAt: "", attendance: { total: attendanceRows.length, present, rate: attendanceRows.length ? Math.round((present / attendanceRows.length) * 100) : null }, report: calculateReport(reportInputs) };
}

async function getStudentResults(studentId: string): Promise<StudentResultBundle> {
  const supabase = await createClient(); const { data: student, error: studentError } = await supabase.from("students").select("id, first_name, last_name, admission_number").eq("id", studentId).single(); fail(studentError); if (!student) throw new ResultError("Student record was not found.");
  const { data: examSubjects, error } = await supabase.from("exam_subjects").select("id, maximum_marks, passing_marks, sections!inner(name, classes!inner(name)), subjects!inner(name, code), exams!inner(id, name, status, updated_at, terms!inner(name, academic_year_id, academic_years!inner(name))), grade_entries!left(marks, status)").eq("grade_entries.student_id", studentId).eq("exams.status", "published").order("exam_date", { ascending: false }); fail(error);
  const grouped = new Map<string, Record<string, unknown>[]>(); for (const row of (examSubjects ?? []) as unknown as Record<string, unknown>[]) { const exam = row.exams as { id: string }; const entries = grouped.get(exam.id) ?? []; entries.push(row); grouped.set(exam.id, entries); }
  const academicYearIds = [...new Set([...grouped.values()].map((rows) => {
    const exam = rows[0].exams as { terms: { academic_year_id: string } };
    return exam.terms.academic_year_id;
  }))];
  const { data: attendanceRows, error: attendanceError } = academicYearIds.length
    ? await supabase.from("attendance_records").select("academic_year_id, status").eq("student_id", studentId).in("academic_year_id", academicYearIds)
    : { data: [], error: null };
  fail(attendanceError);
  const attendanceByYear = new Map<string, { status: string }[]>();
  for (const attendance of attendanceRows ?? []) {
    const entries = attendanceByYear.get(attendance.academic_year_id) ?? [];
    entries.push({ status: attendance.status });
    attendanceByYear.set(attendance.academic_year_id, entries);
  }
  const results = [...grouped.values()].map((rows) => {
    const exam = rows[0].exams as { id: string; name: string; status: string; updated_at: string; terms: { name: string; academic_year_id: string; academic_years: { name: string } } };
    const result = buildStudentResult(exam, rows, attendanceByYear.get(exam.terms.academic_year_id) ?? []);
    return { ...result, publishedAt: exam.updated_at };
  });
  return { studentId: student.id, studentName: name(student), admissionNumber: student.admission_number, results };
}

export async function getOwnResults() { const profile = await requireRole("student"); const supabase = await createClient(); const { data, error } = await supabase.from("students").select("id").eq("profile_id", profile.id).maybeSingle(); fail(error); if (!data) throw new ResultError("No student record is linked to this account."); return getStudentResults(data.id); }
export async function getParentResults() { const profile = await requireRole("parent"); const supabase = await createClient(); const { data: parent, error } = await supabase.from("parents").select("id").eq("profile_id", profile.id).maybeSingle(); fail(error); if (!parent) return []; const { data: links, error: linksError } = await supabase.from("parent_student_links").select("student_id").eq("parent_id", parent.id); fail(linksError); return Promise.all((links ?? []).map((link) => getStudentResults(link.student_id))); }

export async function getResultForReport(examId: string, studentId: string) {
  const profile = await requireCurrentProfile(); let bundle: StudentResultBundle | undefined;
  if (profile.role === "student") { const own = await getOwnResults(); if (own.studentId === studentId) bundle = own; }
  else if (profile.role === "parent") bundle = (await getParentResults()).find((item) => item.studentId === studentId);
  else if (profile.role === "admin") bundle = await getStudentResults(studentId);
  if (!bundle) throw new ResultError("You cannot access this report card."); const result = bundle.results.find((item) => item.examId === examId); if (!result) throw new ResultError("The published result was not found."); return { ...bundle, result };
}
