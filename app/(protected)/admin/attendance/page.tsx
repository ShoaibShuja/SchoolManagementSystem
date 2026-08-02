import { AppShell } from "@/components/shell/app-shell";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/page-header";
import { requireRole } from "@/lib/auth/guards";

export const metadata = { title: "Attendance" };
export default async function AdminAttendancePage() { await requireRole("admin"); return <AppShell role="admin"><div className="space-y-6"><Breadcrumbs items={[{ label: "Admin", href: "/admin" }, { label: "Attendance" }]} /><PageHeader eyebrow="Operations" title="Attendance" description="Today’s marking progress is shown on the dashboard when attendance records exist." /><EmptyState title="Attendance marking is not in this record-management delivery" description="The secure schema is ready. Assigned-teacher daily marking and admin summaries are the next attendance module." /></div></AppShell>; }
