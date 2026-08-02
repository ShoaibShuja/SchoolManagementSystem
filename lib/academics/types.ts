export const weekdays = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
] as const;

export type AcademicYear = { id: string; name: string; startsOn: string; endsOn: string; status: "planned" | "current" | "archived" };
export type Term = { id: string; academicYearId: string; academicYearName: string; name: string; startsOn: string; endsOn: string; status: "planned" | "current" | "closed" };
export type Subject = { id: string; code: string; name: string; description: string | null; isActive: boolean };
export type TeacherOption = { id: string; name: string; employeeNumber: string };
export type SectionOption = { id: string; name: string; className: string };
export type TeacherAssignment = { id: string; teacherId: string; teacherName: string; subjectId: string; subjectName: string; subjectCode: string; sectionId: string; sectionName: string; className: string; academicYearId: string; academicYearName: string; lessonCount: number };
export type TimetableEntry = { id: string; academicYearId: string; sectionId: string; sectionName: string; className: string; assignmentId: string; teacherId: string; teacherName: string; subjectName: string; subjectCode: string; dayOfWeek: number; startTime: string; endTime: string; room: string | null };
export type EnrollmentReview = { id: string; studentName: string; admissionNumber: string; academicYearName: string; sectionName: string; className: string; enrolledOn: string; endedOn: string | null; status: string };
export type AcademicSetup = { years: AcademicYear[]; terms: Term[]; subjects: Subject[]; teachers: TeacherOption[]; sections: SectionOption[]; assignments: TeacherAssignment[]; timetable: TimetableEntry[]; enrollments: EnrollmentReview[] };
