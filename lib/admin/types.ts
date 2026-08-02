export const studentStatuses = ["active", "inactive", "graduated", "withdrawn"] as const;
export const teacherStatuses = ["active", "inactive", "on_leave", "terminated"] as const;

export type StudentStatus = (typeof studentStatuses)[number];
export type TeacherStatus = (typeof teacherStatuses)[number];

export type AcademicYearOption = { id: string; name: string; status: "planned" | "current" | "completed" };
export type SectionOption = { id: string; name: string; classId: string; className: string; capacity: number };

export type StudentListItem = {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  status: StudentStatus;
  enrolledOn: string;
  hasAccount: boolean;
  section: { id: string; name: string; className: string } | null;
  guardian: { id: string; firstName: string; lastName: string; phone: string | null; email: string | null; relationship: string } | null;
};

export type StudentDetail = StudentListItem & { dateOfBirth: string | null; profileId: string | null; academicYearId: string | null };

export type TeacherListItem = {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  qualification: string | null;
  employmentStartedOn: string;
  employmentEndedOn: string | null;
  status: TeacherStatus;
  hasAccount: boolean;
};

export type SectionListItem = { id: string; name: string; capacity: number; activeEnrollmentCount: number };
export type ClassListItem = { id: string; name: string; displayOrder: number; sections: SectionListItem[] };
export type PaginatedResult<T> = { items: T[]; total: number; page: number; pageSize: number };
