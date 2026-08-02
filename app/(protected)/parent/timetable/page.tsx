import { TimetableSchedule } from "@/components/academics/timetable-schedule";
import { AppShell } from "@/components/shell/app-shell";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHeader } from "@/components/shared/page-header";
import { getParentTimetables } from "@/lib/academics/data";
import { requireRole } from "@/lib/auth/guards";

export const metadata = { title: "Children's timetables" };
export default async function ParentTimetablePage() { await requireRole("parent"); const children = await getParentTimetables(); return <AppShell role="parent"><div className="space-y-6"><Breadcrumbs items={[{ label: "Parent", href: "/parent" }, { label: "Timetables" }]} /><PageHeader eyebrow="Family portal" title="Children's timetables" description="Read-only weekly schedules for children linked to your account." />{children.map((child) => <section key={child.studentId} className="space-y-4"><h2 className="text-lg font-semibold">{child.name}</h2><TimetableSchedule entries={child.timetable} emptyMessage="This child’s current section has no scheduled lessons yet." /></section>)}{children.length === 0 ? <p className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">No student records are linked to this account.</p> : null}</div></AppShell>; }
