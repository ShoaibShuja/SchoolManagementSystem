import { AppShell } from "@/components/shell/app-shell";
import { DashboardPlaceholder } from "@/components/shell/dashboard-placeholder";
import { requireRole } from "@/lib/auth/guards";

export const metadata = { title: "Teacher dashboard" };
export default async function TeacherDashboardPage() { await requireRole("teacher"); return <AppShell role="teacher"><DashboardPlaceholder role="teacher" /></AppShell>; }
