import { AppShell } from "@/components/shell/app-shell";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHeader } from "@/components/shared/page-header";
import { requireRole } from "@/lib/auth/guards";
import { getAdminDashboard } from "@/lib/admin/data";
export const metadata = { title: "Admin dashboard" };
export default async function AdminDashboardPage() { await requireRole("admin"); const dashboard = await getAdminDashboard(); return <AppShell role="admin"><div className="space-y-6"><Breadcrumbs items={[{ label: "Admin" }, { label: "Dashboard" }]} /><PageHeader eyebrow="School overview" title="Admin dashboard" description="A concise view of student, attendance, fee, academic, and announcement operations." /><AdminDashboard initialData={dashboard} /></div></AppShell>; }
