import Link from "next/link";
import { ArrowRight, CalendarCheck, Clock3, LayoutGrid, Users, type LucideIcon } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import type { ParentChildAttendance, PersonalAttendance } from "@/lib/attendance/types";

function Metrics({ items }: { items: { label: string; value: string | number; detail: string; icon: LucideIcon; tone: string }[] }) {
  return (
    <section aria-label="Overview" className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <article key={item.label} className={`dashboard-stat rounded-2xl border border-white/70 p-5 ${item.tone}`}>
            <div className="flex items-start justify-between gap-3"><p className="text-sm font-medium opacity-75">{item.label}</p><span className="grid size-9 place-items-center rounded-xl bg-white/55"><Icon className="size-[18px]" aria-hidden /></span></div>
            <p className="mt-5 text-2xl font-semibold tracking-tight">{item.value}</p>
            <p className="mt-1 text-xs opacity-75">{item.detail}</p>
          </article>
        );
      })}
    </section>
  );
}

export function TeacherDashboardView({ sections, tasks }: { sections: number; tasks: { section: { id: string; className: string; name: string }; total: number; marked: number }[] }) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="dashboard-hero relative overflow-hidden rounded-3xl px-5 py-6 text-white sm:px-8 sm:py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Teaching desk</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Your classrooms, all in step.</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">Start with today’s attendance, then move on to your assigned classes, timetable, and grade work.</p>
        <Button className="mt-5 bg-white text-dashboard-ink hover:bg-white/90" asChild><Link href="/teacher/attendance"><CalendarCheck className="size-4" /> Mark attendance</Link></Button>
      </section>

      <Metrics items={[
        { label: "Assigned sections", value: sections, detail: "Your current teaching groups", icon: Users, tone: "bg-dashboard-aura text-dashboard-ink" },
        { label: "Attendance tasks", value: tasks.length, detail: "Sections to review today", icon: CalendarCheck, tone: "bg-dashboard-mint text-accent-foreground" },
        { label: "Timetable", value: "View week", detail: "Your teaching schedule", icon: LayoutGrid, tone: "bg-dashboard-lilac text-foreground" },
      ]} />

      <section className="dashboard-surface rounded-2xl border bg-card p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-info">Today</p><h2 className="mt-1 text-lg font-semibold tracking-tight">Attendance progress</h2><p className="mt-1 text-sm text-muted-foreground">Save each class as you complete its register.</p></div>
          <Button variant="outline" asChild><Link href="/teacher/attendance">Open attendance <ArrowRight className="size-4" /></Link></Button>
        </div>
        {tasks.length ? <ul className="mt-5 divide-y divide-border">{tasks.map((task) => <li key={task.section.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-dashboard-sun text-foreground"><CalendarCheck className="size-4" aria-hidden /></span><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{task.section.className} · {task.section.name}</p><p className="mt-0.5 text-xs text-muted-foreground">{task.marked} of {task.total} records saved</p></div><span className="text-sm font-semibold text-brand">{task.total ? Math.round((task.marked / task.total) * 100) : 0}%</span></li>)}</ul> : <div className="mt-5 rounded-xl border border-dashed bg-muted/50 p-5 text-sm text-muted-foreground">No attendance tasks are assigned for today.</div>}
      </section>
    </div>
  );
}

export function StudentDashboardView({ attendance }: { attendance: PersonalAttendance }) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="dashboard-hero relative overflow-hidden rounded-3xl px-5 py-6 text-white sm:px-8 sm:py-8"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">My school day</p><h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Stay connected to your progress.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/80">View your attendance, timetable, results, and school updates in one place.</p><Button className="mt-5 bg-white text-dashboard-ink hover:bg-white/90" asChild><Link href="/student/attendance">View attendance <ArrowRight className="size-4" /></Link></Button></section>
      <Metrics items={[
        { label: "Current class", value: attendance.section ?? "Not enrolled", detail: "Your active placement", icon: LayoutGrid, tone: "bg-dashboard-aura text-dashboard-ink" },
        { label: "Attendance rate", value: `${attendance.summary.rate}%`, detail: "Based on recorded days", icon: CalendarCheck, tone: "bg-dashboard-mint text-accent-foreground" },
        { label: "Recent records", value: attendance.recent.length, detail: "Latest attendance entries", icon: Clock3, tone: "bg-dashboard-lilac text-foreground" },
      ]} />
    </div>
  );
}

export function ParentDashboardView({ linkedChildren }: { linkedChildren: ParentChildAttendance[] }) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="dashboard-hero relative overflow-hidden rounded-3xl px-5 py-6 text-white sm:px-8 sm:py-8"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Family portal</p><h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">A clear view of your child’s school life.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/80">Check attendance, learning updates, results, and fee records for children linked to your account.</p><Button className="mt-5 bg-white text-dashboard-ink hover:bg-white/90" asChild><Link href="/parent/attendance">View attendance <ArrowRight className="size-4" /></Link></Button></section>
      <Metrics items={[
        { label: "Linked children", value: linkedChildren.length, detail: "Available in this portal", icon: Users, tone: "bg-dashboard-aura text-dashboard-ink" },
        { label: "Attendance available", value: linkedChildren.filter((child) => child.summary.total > 0).length, detail: "Children with recorded days", icon: CalendarCheck, tone: "bg-dashboard-mint text-accent-foreground" },
        { label: "Portal access", value: "Read-only", detail: "School records stay protected", icon: Clock3, tone: "bg-dashboard-lilac text-foreground" },
      ]} />
      <section className="dashboard-surface rounded-2xl border bg-card p-5 sm:p-6"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-info">Family overview</p><h2 className="mt-1 text-lg font-semibold tracking-tight">Your children</h2></div>{linkedChildren.length ? <ul className="mt-4 divide-y divide-border">{linkedChildren.map((child) => <li key={child.studentId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-dashboard-sun text-foreground"><Users className="size-4" aria-hidden /></span><div className="min-w-0 flex-1"><p className="font-semibold">{child.studentName}</p><p className="text-sm text-muted-foreground">{child.section ?? "No current section"}</p></div><StatusBadge label={`${child.summary.rate}% attendance`} status="info" /></li>)}</ul> : <p className="mt-4 rounded-xl border border-dashed bg-muted/50 p-5 text-sm text-muted-foreground">No children are linked to this account yet. Contact the school office if this needs to be updated.</p>}</section>
    </div>
  );
}
