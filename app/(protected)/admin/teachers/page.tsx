import { TeacherManagement } from "@/components/admin/teacher-management";
import { AppShell } from "@/components/shell/app-shell";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHeader } from "@/components/shared/page-header";
import { listTeachers } from "@/lib/admin/data";
import { requireRole } from "@/lib/auth/guards";

export const metadata = { title: "Teachers" };
export default async function TeachersPage() { await requireRole("admin"); const teachers = await listTeachers({ page: 1, pageSize: 15 }); return <AppShell role="admin"><div className="space-y-6"><Breadcrumbs items={[{ label: "Admin", href: "/admin" }, { label: "Teachers" }]} /><PageHeader eyebrow="Records" title="Teachers and staff" description="Maintain teaching staff contacts, qualifications, and employment status. Payroll and HR workflows are intentionally out of scope." /><TeacherManagement initialData={teachers} /></div></AppShell>; }
