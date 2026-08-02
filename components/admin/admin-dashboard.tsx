"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, GraduationCap, LayoutList, Users } from "lucide-react";
import { ErrorState } from "@/components/shared/states";
import { requestJson } from "@/lib/admin/client";
import { queryKeys } from "@/lib/query-keys";

type DashboardData = { activeStudents: number; activeTeachers: number; classes: number; sections: number; academicYear: string | null; attendance: { marked: number; total: number } | null; pendingAttendance: number | null };

export function AdminDashboard({ initialData }: { initialData: DashboardData }) {
  const dashboard = useQuery({ queryKey: queryKeys.dashboard("admin"), queryFn: () => requestJson<DashboardData>("/api/admin/dashboard"), initialData });
  if (dashboard.isError) return <ErrorState title="Dashboard could not be refreshed" description={dashboard.error.message} onRetry={() => dashboard.refetch()} />;
  const data = dashboard.data;
  const attendance = data.attendance ? data.attendance.total === 0 ? "No active enrollments" : `${data.attendance.marked} of ${data.attendance.total} marked` : "Set a current academic year";
  const items = [{ label: "Active students", value: data.activeStudents, icon: GraduationCap }, { label: "Active teachers", value: data.activeTeachers, icon: Users }, { label: "Classes and sections", value: `${data.classes} / ${data.sections}`, icon: LayoutList }, { label: "Today’s attendance", value: attendance, icon: CalendarCheck }, { label: "Pending attendance", value: data.pendingAttendance ?? "—", icon: CalendarCheck }];
  return <section className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 xl:grid-cols-5">{items.map((item) => { const Icon = item.icon; return <article key={item.label} className="bg-card p-5"><div className="flex items-start justify-between gap-3"><p className="text-sm text-muted-foreground">{item.label}</p><Icon className="size-4 text-muted-foreground" aria-hidden /></div><p className="mt-5 text-2xl font-semibold tracking-tight">{item.value}</p>{item.label === "Today’s attendance" && data.academicYear ? <p className="mt-1 text-xs text-muted-foreground">{data.academicYear}</p> : null}</article>; })}</section>;
}
