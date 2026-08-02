"use client";

import { Clock3, MapPin } from "lucide-react";
import type { TimetableEntry } from "@/lib/academics/types";
import { weekdays } from "@/lib/academics/types";

export function TimetableSchedule({ entries, emptyMessage = "No lessons are scheduled yet." }: { entries: TimetableEntry[]; emptyMessage?: string }) {
  if (entries.length === 0) return <p className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">{emptyMessage}</p>;
  return <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">{weekdays.map((day) => {
    const lessons = entries.filter((entry) => entry.dayOfWeek === day.value);
    if (lessons.length === 0) return null;
    return <section key={day.value} className="overflow-hidden rounded-lg border bg-card"><header className="border-b bg-muted/40 px-4 py-3"><h2 className="font-semibold">{day.label}</h2></header><div className="divide-y">{lessons.map((entry) => <article key={entry.id} className="space-y-2 px-4 py-3"><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{entry.subjectName}</p><p className="text-xs text-muted-foreground">{entry.className} · Section {entry.sectionName}</p></div><p className="shrink-0 text-sm font-medium tabular-nums">{entry.startTime}–{entry.endTime}</p></div><div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground"><span>{entry.teacherName}</span>{entry.room ? <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{entry.room}</span> : null}</div></article>)}</div></section>;
  })}</div>;
}

export function TimetableCompactList({ entries, emptyMessage = "No lessons are scheduled yet." }: { entries: TimetableEntry[]; emptyMessage?: string }) {
  if (entries.length === 0) return <p className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">{emptyMessage}</p>;
  return <div className="space-y-2">{entries.map((entry) => <article key={entry.id} className="flex flex-col gap-2 rounded-lg border bg-card p-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{weekdays.find((day) => day.value === entry.dayOfWeek)?.label} · {entry.subjectName}</p><p className="text-sm text-muted-foreground">{entry.className} · Section {entry.sectionName} · {entry.teacherName}{entry.room ? ` · ${entry.room}` : ""}</p></div><span className="inline-flex items-center gap-1 text-sm font-medium tabular-nums"><Clock3 className="size-4" />{entry.startTime}–{entry.endTime}</span></article>)}</div>;
}
