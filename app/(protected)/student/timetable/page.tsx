import { TimetableSchedule } from "@/components/academics/timetable-schedule";
import { AppShell } from "@/components/shell/app-shell";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHeader } from "@/components/shared/page-header";
import { getOwnTimetable } from "@/lib/academics/data";
import { requireRole } from "@/lib/auth/guards";

export const metadata = { title: "My timetable" };
export default async function StudentTimetablePage() { await requireRole("student"); const result = await getOwnTimetable(); return <AppShell role="student"><div className="space-y-6"><Breadcrumbs items={[{ label: "Student", href: "/student" }, { label: "Timetable" }]} /><PageHeader eyebrow="My school" title="My timetable" description={`${result.name}, this is the weekly schedule for your current section.`} /><TimetableSchedule entries={result.timetable} emptyMessage="Your current section has no scheduled lessons yet." /></div></AppShell>; }
