import { AppShell } from "@/components/shell/app-shell";
import { DashboardPlaceholder } from "@/components/shell/dashboard-placeholder";
import { requireRole } from "@/lib/auth/guards";

export const metadata = { title: "Student dashboard" };
export default async function StudentDashboardPage() { await requireRole("student"); return <AppShell role="student"><DashboardPlaceholder role="student" /></AppShell>; }
