import { AppShell } from "@/components/shell/app-shell";
import { StudentDashboardView } from "@/components/attendance/role-dashboards";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHeader } from "@/components/shared/page-header";
import { getOwnAttendance } from "@/lib/attendance/data";
import { requireRole } from "@/lib/auth/guards";

export const metadata = { title: "Student dashboard" };
export default async function StudentDashboardPage() { await requireRole("student"); const attendance = await getOwnAttendance(); return <AppShell role="student"><div className="space-y-6"><Breadcrumbs items={[{ label: "Student" }, { label: "Dashboard" }]} /><PageHeader eyebrow="My school" title={attendance.studentName} description="Your current class and attendance summary." /><StudentDashboardView attendance={attendance} /></div></AppShell>; }
