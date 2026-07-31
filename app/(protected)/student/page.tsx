import { AppShell } from "@/components/shell/app-shell";
import { DashboardPlaceholder } from "@/components/shell/dashboard-placeholder";

export const metadata = { title: "Student dashboard" };
export default function StudentDashboardPage() { return <AppShell role="student"><DashboardPlaceholder role="student" /></AppShell>; }
