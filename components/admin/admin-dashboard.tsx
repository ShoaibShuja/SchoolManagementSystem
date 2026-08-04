"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Bell,
  CalendarCheck,
  CreditCard,
  FileBarChart2,
  GraduationCap,
  LayoutList,
  Users,
} from "lucide-react";
import { ErrorState } from "@/components/shared/states";
import { requestJson } from "@/lib/admin/client";
import { queryKeys } from "@/lib/query-keys";

type DashboardData = {
  activeStudents: number;
  activeTeachers: number;
  classes: number;
  sections: number;
  academicYear: string | null;
  attendance: { marked: number; total: number } | null;
  pendingAttendance: number | null;
  pendingFees?: number;
  announcements?: Array<{ id: string; title: string }>;
};

const cardStyles = [
  "bg-dashboard-aura text-dashboard-ink",
  "bg-dashboard-mint text-accent-foreground",
  "bg-dashboard-lilac text-foreground",
  "bg-dashboard-sun text-foreground",
  "bg-card text-foreground",
];

export function AdminDashboard({ initialData }: { initialData: DashboardData }) {
  const dashboard = useQuery({
    queryKey: queryKeys.dashboard("admin"),
    queryFn: () => requestJson<DashboardData>("/api/admin/dashboard"),
    initialData,
  });

  if (dashboard.isError) {
    return <ErrorState title="Dashboard could not be refreshed" description={dashboard.error.message} onRetry={() => dashboard.refetch()} />;
  }

  const data = dashboard.data;
  const attendance = data.attendance
    ? data.attendance.total === 0
      ? "No active enrollments"
      : `${data.attendance.marked} of ${data.attendance.total}`
    : "Not configured";
  const cards = [
    { label: "Active students", value: data.activeStudents, detail: "Currently enrolled", icon: GraduationCap },
    { label: "Active teachers", value: data.activeTeachers, detail: "Teaching staff", icon: Users },
    { label: "Classes & sections", value: `${data.classes} / ${data.sections}`, detail: "Learning groups", icon: LayoutList },
    { label: "Today's attendance", value: attendance, detail: data.academicYear ?? "Set an academic year", icon: CalendarCheck },
    { label: "Fees needing review", value: data.pendingFees ?? "—", detail: "Pending or overdue", icon: CreditCard },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="dashboard-hero relative overflow-hidden rounded-3xl px-5 py-6 text-white sm:px-8 sm:py-8">
        <div className="relative max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Operations at a glance</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Keep the school day moving with clarity.</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">Review attendance, records, fees, and the latest school communications from one calm, focused workspace.</p>
        </div>
        <div className="relative mt-5 flex flex-wrap gap-2 text-sm">
          <Link href="/admin/attendance" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 font-semibold text-dashboard-ink transition-opacity hover:opacity-90">
            <CalendarCheck className="size-4" /> Review attendance
          </Link>
          <Link href="/admin/students" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 font-semibold text-white transition-colors hover:bg-white/20">
            <GraduationCap className="size-4" /> Student records
          </Link>
        </div>
      </section>

      <section aria-label="School overview" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((item, index) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className={`dashboard-stat min-h-40 rounded-2xl border border-white/70 p-5 ${cardStyles[index]}`}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium opacity-75">{item.label}</p>
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/55">
                  <Icon className="size-[18px]" aria-hidden />
                </span>
              </div>
              <p className="mt-5 text-2xl font-semibold tracking-tight">{item.value}</p>
              <p className="mt-1 text-xs leading-5 opacity-75">{item.detail}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
        <article className="dashboard-surface rounded-2xl border bg-card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-info">Communication</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">Recent announcements</h2>
            </div>
            <Link href="/admin/announcements" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-brand hover:underline">
              Manage <ArrowRight className="size-4" />
            </Link>
          </div>
          {data.announcements?.length ? (
            <ul className="mt-4 divide-y divide-border">
              {data.announcements.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-dashboard-lilac text-foreground"><Bell className="size-4" aria-hidden /></span>
                  <p className="min-w-0 flex-1 truncate text-sm font-medium">{item.title}</p>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed bg-muted/50 p-5 text-sm text-muted-foreground">No published announcements yet. Create one to keep your school community informed.</div>
          )}
        </article>

        <article className="dashboard-surface rounded-2xl border bg-card p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-success">Daily workflow</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">Useful next steps</h2>
          <div className="mt-4 grid gap-2">
            {[
              { href: "/admin/attendance", label: "Attendance", detail: "Check today’s registers", icon: CalendarCheck, color: "bg-dashboard-aura" },
              { href: "/admin/fees", label: "Fees", detail: "Review due balances", icon: CreditCard, color: "bg-dashboard-sun" },
              { href: "/admin/reports", label: "Reports", detail: "Prepare school records", icon: FileBarChart2, color: "bg-dashboard-mint" },
            ].map((task) => {
              const Icon = task.icon;
              return (
                <Link key={task.href} href={task.href} className="group flex min-h-16 items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted">
                  <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${task.color} text-foreground`}><Icon className="size-4" aria-hidden /></span>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{task.label}</span><span className="block text-xs text-muted-foreground">{task.detail}</span></span>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              );
            })}
          </div>
        </article>
      </section>
    </div>
  );
}
