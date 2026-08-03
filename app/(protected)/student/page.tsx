import { AppShell } from "@/components/shell/app-shell";
import { StudentPortalDashboard } from "@/components/portals/portal-dashboard";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHeader } from "@/components/shared/page-header";
import { getOwnAttendance } from "@/lib/attendance/data";
import { getVisibleAnnouncements } from "@/lib/announcements/data";
import { requireRole } from "@/lib/auth/guards";

export const metadata = { title: "Student dashboard" };
export default async function StudentDashboardPage() { await requireRole("student"); const [attendance, announcements] = await Promise.all([getOwnAttendance(), getVisibleAnnouncements()]); return <AppShell role="student"><div className="space-y-6"><Breadcrumbs items={[{ label: "Student" }, { label: "Dashboard" }]} /><PageHeader eyebrow="My school" title={attendance.studentName} description="Your class, learning information, and recent school updates." /><StudentPortalDashboard section={attendance.section} rate={attendance.summary.rate} announcements={announcements} /></div></AppShell>; }
