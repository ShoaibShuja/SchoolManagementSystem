import { AppShell } from "@/components/shell/app-shell";
import { DashboardPlaceholder } from "@/components/shell/dashboard-placeholder";

export const metadata = { title: "Teacher dashboard" };
export default function TeacherDashboardPage() { return <AppShell role="teacher"><DashboardPlaceholder role="teacher" /></AppShell>; }
