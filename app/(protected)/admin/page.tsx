import { AppShell } from "@/components/shell/app-shell";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHeader } from "@/components/shared/page-header";
import { requireRole } from "@/lib/auth/guards";
import { getAdminDashboard } from "@/lib/admin/data";

export const metadata = { title: "Admin dashboard" };
export default async function AdminDashboardPage() {
  await requireRole("admin");
  const dashboard = await getAdminDashboard();
  return <AppShell role="admin"><div className="space-y-6"><Breadcrumbs items={[{ label: "Admin" }, { label: "Dashboard" }]} /><PageHeader eyebrow="School overview" title="Admin dashboard" description="A concise view of active records and today’s attendance progress." /><AdminDashboard initialData={dashboard} /><section className="rounded-lg border border-dashed bg-card px-5 py-6"><h2 className="font-semibold">Operations note</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Fee tracking and announcements are not part of this MVP record-management phase, so this dashboard does not show placeholder totals for them.</p></section></div></AppShell>;
}
