import { AppShell } from "@/components/shell/app-shell";
import { DashboardPlaceholder } from "@/components/shell/dashboard-placeholder";

export const metadata = { title: "Parent dashboard" };
export default function ParentDashboardPage() { return <AppShell role="parent"><DashboardPlaceholder role="parent" /></AppShell>; }
