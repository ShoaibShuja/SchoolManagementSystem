import { AttendanceEditor } from "@/components/attendance/attendance-editor";
import { AppShell } from "@/components/shell/app-shell";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHeader } from "@/components/shared/page-header";
import { getTeacherSections } from "@/lib/attendance/data";
import { requireRole } from "@/lib/auth/guards";

export const metadata = { title: "Attendance" };
export default async function TeacherAttendancePage() { await requireRole("teacher"); const sections = await getTeacherSections(); return <AppShell role="teacher"><div className="space-y-6"><Breadcrumbs items={[{ label: "Teacher", href: "/teacher" }, { label: "Attendance" }]} /><PageHeader eyebrow="Daily work" title="Mark attendance" description="Only your current assigned sections are available. Saving again corrects the existing daily record." /><AttendanceEditor role="teacher" sections={sections} /></div></AppShell>; }
