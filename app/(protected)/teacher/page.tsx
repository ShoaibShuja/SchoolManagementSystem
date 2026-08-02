import { AppShell } from "@/components/shell/app-shell";
import { TeacherDashboardView } from "@/components/attendance/role-dashboards";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHeader } from "@/components/shared/page-header";
import { getTeacherDashboard } from "@/lib/attendance/data";
import { requireRole } from "@/lib/auth/guards";

export const metadata = { title: "Teacher dashboard" };
export default async function TeacherDashboardPage() { await requireRole("teacher"); const dashboard = await getTeacherDashboard(); return <AppShell role="teacher"><div className="space-y-6"><Breadcrumbs items={[{ label: "Teacher" }, { label: "Dashboard" }]} /><PageHeader eyebrow="My work" title="Teacher dashboard" description="Your current sections and today’s attendance tasks." /><TeacherDashboardView sections={dashboard.sections.length} tasks={dashboard.todayTasks} /></div></AppShell>; }
