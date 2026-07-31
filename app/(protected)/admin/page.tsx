import { AppShell } from "@/components/shell/app-shell";
import { DashboardPlaceholder } from "@/components/shell/dashboard-placeholder";

export const metadata = { title: "Admin dashboard" };
export default function AdminDashboardPage() { return <AppShell role="admin"><DashboardPlaceholder role="admin" /></AppShell>; }
