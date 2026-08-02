import type { StudentListItem, TeacherListItem } from "@/lib/admin/types";

export function matchesStudentFilter(student: StudentListItem, query: string, status?: string, sectionId?: string) {
  const term = query.trim().toLocaleLowerCase();
  const searchable = `${student.firstName} ${student.lastName} ${student.admissionNumber}`.toLocaleLowerCase();
  return (!term || searchable.includes(term)) && (!status || student.status === status) && (!sectionId || student.section?.id === sectionId);
}

export function matchesTeacherFilter(teacher: TeacherListItem, query: string, status?: string) {
  const term = query.trim().toLocaleLowerCase();
  const searchable = `${teacher.firstName} ${teacher.lastName} ${teacher.employeeNumber} ${teacher.email ?? ""}`.toLocaleLowerCase();
  return (!term || searchable.includes(term)) && (!status || teacher.status === status);
}
