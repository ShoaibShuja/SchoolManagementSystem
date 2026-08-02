import type { ReportResult } from "@/lib/results/calculations";

export type ExamStatus = "draft" | "open" | "published" | "closed";
export type ExamItem = { id: string; name: string; termId: string; termName: string; academicYearId: string; academicYearName: string; startsOn: string; endsOn: string; status: ExamStatus; subjectCount: number };
export type ExamSubjectItem = { id: string; examId: string; examName: string; status: ExamStatus; sectionId: string; sectionName: string; className: string; subjectId: string; subjectName: string; subjectCode: string; examDate: string; maximumMarks: number; passingMarks: number | null; gradeCount: number };
export type ExamSetup = { terms: { id: string; name: string; academicYearId: string; academicYearName: string }[]; subjects: { id: string; name: string; code: string }[]; sections: { id: string; name: string; className: string }[]; exams: ExamItem[]; examSubjects: ExamSubjectItem[] };
export type GradeStatus = "graded" | "absent" | "exempt";
export type GradebookRow = { studentId: string; studentName: string; admissionNumber: string; marks: number | null; status: GradeStatus | null; remarks: string; updatedBy: string | null; updatedAt: string | null };
export type Gradebook = { examSubject: ExamSubjectItem; rows: GradebookRow[]; canEdit: boolean };
export type StudentResult = { examId: string; examName: string; termName: string; academicYearName: string; className: string; sectionName: string; publishedAt: string; attendance: { total: number; present: number; rate: number | null }; report: ReportResult };
export type StudentResultBundle = { studentId: string; studentName: string; admissionNumber: string; results: StudentResult[] };
