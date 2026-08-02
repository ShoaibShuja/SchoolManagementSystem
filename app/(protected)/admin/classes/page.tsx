import { ClassManagement } from "@/components/admin/class-management";
import { AppShell } from "@/components/shell/app-shell";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHeader } from "@/components/shared/page-header";
import { getAcademicYears, listClasses } from "@/lib/admin/data";
import { requireRole } from "@/lib/auth/guards";

export const metadata = { title: "Classes" };
export default async function ClassesPage() { await requireRole("admin"); const academicYears = await getAcademicYears(); const currentYearId = academicYears.find((year) => year.status === "current")?.id; const classes = await listClasses(currentYearId); return <AppShell role="admin"><div className="space-y-6"><Breadcrumbs items={[{ label: "Admin", href: "/admin" }, { label: "Classes" }]} /><PageHeader eyebrow="Academic setup" title="Classes and sections" description="Set section capacity before enrolling students. A student may have one active section in an academic year." /><ClassManagement initialData={classes} academicYears={academicYears} initialAcademicYearId={currentYearId} /></div></AppShell>; }
