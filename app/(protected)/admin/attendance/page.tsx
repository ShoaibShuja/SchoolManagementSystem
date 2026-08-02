import { AdminAttendance } from "@/components/attendance/admin-attendance";
import { AppShell } from "@/components/shell/app-shell";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHeader } from "@/components/shared/page-header";
import { getAcademicYears, getSectionOptions } from "@/lib/admin/data";
import { getAdminAttendance } from "@/lib/attendance/data";
import { requireRole } from "@/lib/auth/guards";

export const metadata = { title: "Attendance" };
export default async function AdminAttendancePage() { await requireRole("admin"); const [sectionOptions, academicYears, initialData] = await Promise.all([getSectionOptions(), getAcademicYears(), getAdminAttendance({ date: new Date().toISOString().slice(0, 10) })]); const current = academicYears.find((year) => year.status === "current"); const sections = current ? sectionOptions.map((section) => ({ id: section.id, name: section.name, className: section.className, academicYearId: current.id, academicYearName: current.name })) : []; return <AppShell role="admin"><div className="space-y-6"><Breadcrumbs items={[{ label: "Admin", href: "/admin" }, { label: "Attendance" }]} /><PageHeader eyebrow="Operations" title="Attendance" description="Review daily attendance, make authorized corrections, and see who last saved each record." /><AdminAttendance sections={sections} initialData={initialData} /></div></AppShell>; }
