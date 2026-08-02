import { PersonalAttendanceView } from "@/components/attendance/personal-attendance";
import { AppShell } from "@/components/shell/app-shell";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHeader } from "@/components/shared/page-header";
import { getOwnAttendance } from "@/lib/attendance/data";
import { requireRole } from "@/lib/auth/guards";

export const metadata = { title: "My attendance" };
export default async function StudentAttendancePage() { await requireRole("student"); const attendance = await getOwnAttendance(); return <AppShell role="student"><div className="space-y-6"><Breadcrumbs items={[{ label: "Student", href: "/student" }, { label: "Attendance" }]} /><PageHeader eyebrow="My records" title="Attendance" description={`Read-only attendance records for ${attendance.studentName}${attendance.section ? ` · ${attendance.section}` : ""}.`} /><PersonalAttendanceView attendance={attendance} /></div></AppShell>; }
