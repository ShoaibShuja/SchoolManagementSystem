import { AppShell } from "@/components/shell/app-shell";
import { DashboardPlaceholder } from "@/components/shell/dashboard-placeholder";
import { requireRole } from "@/lib/auth/guards";

export const metadata = { title: "Admin dashboard" };
export default async function AdminDashboardPage() { await requireRole("admin"); return <AppShell role="admin"><DashboardPlaceholder role="admin" /></AppShell>; }
