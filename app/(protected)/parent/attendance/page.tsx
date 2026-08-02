import { ParentAttendanceSelector } from "@/components/attendance/parent-attendance-selector";
import { AppShell } from "@/components/shell/app-shell";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/page-header";
import { getParentAttendance } from "@/lib/attendance/data";
import { requireRole } from "@/lib/auth/guards";

export const metadata = { title: "Child attendance" };
export default async function ParentAttendancePage() { await requireRole("parent"); const children = await getParentAttendance(); return <AppShell role="parent"><div className="space-y-6"><Breadcrumbs items={[{ label: "Parent", href: "/parent" }, { label: "Attendance" }]} /><PageHeader eyebrow="Children" title="Attendance" description="Read-only attendance for children linked to your account." />{children.length ? <ParentAttendanceSelector linkedChildren={children} /> : <EmptyState title="No linked children" description="Attendance appears after an administrator links a student to your parent account." />}</div></AppShell>; }
