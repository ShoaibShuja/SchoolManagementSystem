import { AppShell } from "@/components/shell/app-shell";
import { ParentDashboardView } from "@/components/attendance/role-dashboards";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHeader } from "@/components/shared/page-header";
import { getParentAttendance } from "@/lib/attendance/data";
import { requireRole } from "@/lib/auth/guards";

export const metadata = { title: "Parent dashboard" };
export default async function ParentDashboardPage() { await requireRole("parent"); const children = await getParentAttendance(); return <AppShell role="parent"><div className="space-y-6"><Breadcrumbs items={[{ label: "Parent" }, { label: "Dashboard" }]} /><PageHeader eyebrow="Family portal" title="Parent dashboard" description="Read-only information for children linked to your account." /><ParentDashboardView linkedChildren={children} /></div></AppShell>; }
