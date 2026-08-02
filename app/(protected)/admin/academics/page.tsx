import { AcademicManagement } from "@/components/academics/academic-management";
import { AppShell } from "@/components/shell/app-shell";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHeader } from "@/components/shared/page-header";
import { getAcademicSetup } from "@/lib/academics/data";
import { requireRole } from "@/lib/auth/guards";

export const metadata = { title: "Academic setup" };
export default async function AcademicsPage() { await requireRole("admin"); const setup = await getAcademicSetup(); return <AppShell role="admin"><div className="space-y-6"><Breadcrumbs items={[{ label: "Admin", href: "/admin" }, { label: "Academic setup" }]} /><PageHeader eyebrow="Academic setup" title="Years, subjects, and timetable" description="Build the school calendar, assign teaching work, and schedule weekly lessons without changing historical enrollments." /><AcademicManagement initialData={setup} /></div></AppShell>; }
