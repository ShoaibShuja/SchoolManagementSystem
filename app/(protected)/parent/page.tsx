import { AppShell } from "@/components/shell/app-shell";
import { DashboardPlaceholder } from "@/components/shell/dashboard-placeholder";
import { requireRole } from "@/lib/auth/guards";

export const metadata = { title: "Parent dashboard" };
export default async function ParentDashboardPage() { await requireRole("parent"); return <AppShell role="parent"><DashboardPlaceholder role="parent" /></AppShell>; }
