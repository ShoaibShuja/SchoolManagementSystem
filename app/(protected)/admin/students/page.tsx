import { StudentManagement } from "@/components/admin/student-management";
import { AppShell } from "@/components/shell/app-shell";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHeader } from "@/components/shared/page-header";
import { getAcademicYears, getSectionOptions, listStudents } from "@/lib/admin/data";
import { requireRole } from "@/lib/auth/guards";

export const metadata = { title: "Students" };
export default async function StudentsPage() {
  await requireRole("admin");
  const [academicYears, sections] = await Promise.all([getAcademicYears(), getSectionOptions()]);
  const currentYearId = academicYears.find((year) => year.status === "current")?.id;
  const students = await listStudents({ page: 1, pageSize: 15, academicYearId: currentYearId });
  return <AppShell role="admin"><div className="space-y-6"><Breadcrumbs items={[{ label: "Admin", href: "/admin" }, { label: "Students" }]} /><PageHeader eyebrow="Records" title="Students" description="Maintain student records, enrollment, and primary guardian contacts. Login accounts remain optional." /><StudentManagement initialData={students} academicYears={academicYears} sections={sections} initialAcademicYearId={currentYearId} /></div></AppShell>;
}
