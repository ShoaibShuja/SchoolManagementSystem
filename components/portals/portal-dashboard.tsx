import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BookOpenCheck,
  CalendarCheck,
  CreditCard,
  LayoutGrid,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { AnnouncementList } from "@/components/announcements/announcement-list";
import { Button } from "@/components/ui/button";
import type { Announcement } from "@/lib/announcements/types";

type PortalLink = { href: string; label: string; detail: string; icon: LucideIcon; tone: string };

const studentLinks: PortalLink[] = [
  { href: "/student/timetable", label: "Timetable", detail: "See your weekly schedule", icon: LayoutGrid, tone: "bg-dashboard-aura" },
  { href: "/student/attendance", label: "Attendance", detail: "Follow your daily record", icon: CalendarCheck, tone: "bg-dashboard-mint" },
  { href: "/student/results", label: "Results & report cards", detail: "View published results", icon: BookOpenCheck, tone: "bg-dashboard-lilac" },
  { href: "/student/announcements", label: "Announcements", detail: "Read school updates", icon: Bell, tone: "bg-dashboard-sun" },
  { href: "/student/fees", label: "Fee records", detail: "Review balances", icon: CreditCard, tone: "bg-muted" },
];

const parentLinks: PortalLink[] = [
  { href: "/parent/timetable", label: "Timetables", detail: "Review weekly schedules", icon: LayoutGrid, tone: "bg-dashboard-aura" },
  { href: "/parent/attendance", label: "Attendance", detail: "Follow attendance records", icon: CalendarCheck, tone: "bg-dashboard-mint" },
  { href: "/parent/results", label: "Results & report cards", detail: "View published results", icon: BookOpenCheck, tone: "bg-dashboard-lilac" },
  { href: "/parent/announcements", label: "Announcements", detail: "Read school updates", icon: Bell, tone: "bg-dashboard-sun" },
  { href: "/parent/fees", label: "Fee records", detail: "Review fee information", icon: CreditCard, tone: "bg-muted" },
];

function OverviewCard({ label, value, detail, icon: Icon, tone }: { label: string; value: string | number; detail: string; icon: LucideIcon; tone: string }) {
  return <article className={`dashboard-stat rounded-2xl border border-white/70 p-5 ${tone}`}><div className="flex items-start justify-between gap-3"><p className="text-sm font-medium opacity-75">{label}</p><span className="grid size-9 place-items-center rounded-xl bg-white/55"><Icon className="size-[18px]" aria-hidden /></span></div><p className="mt-5 text-2xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-xs opacity-75">{detail}</p></article>;
}

function PortalLinks({ items }: { items: PortalLink[] }) {
  return <section aria-label="Portal shortcuts" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
    {items.map((item) => {
      const Icon = item.icon;
      return <Link key={item.href} href={item.href} className="dashboard-surface group flex min-h-24 items-center gap-4 rounded-2xl border bg-card p-4 transition-colors hover:bg-muted/60"><span className={`grid size-11 shrink-0 place-items-center rounded-xl ${item.tone} text-foreground`}><Icon className="size-5" aria-hidden /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{item.label}</span><span className="mt-0.5 block text-xs text-muted-foreground">{item.detail}</span></span><ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden /></Link>;
    })}
  </section>;
}

function PortalAnnouncements({ href, announcements }: { href: string; announcements: Announcement[] }) {
  return <section className="dashboard-surface rounded-2xl border bg-card p-5 sm:p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-info">Stay informed</p><h2 className="mt-1 text-lg font-semibold tracking-tight">Recent announcements</h2></div><Button asChild size="sm" variant="outline"><Link href={href}>View all <ArrowRight className="size-4" /></Link></Button></div><div className="mt-4"><AnnouncementList announcements={announcements} empty="No recent announcements. School updates will appear here." /></div></section>;
}

export function StudentPortalDashboard({ section, rate, announcements }: { section: string | null; rate: number; announcements: Announcement[] }) {
  return <div className="space-y-6 sm:space-y-8"><section className="dashboard-hero relative overflow-hidden rounded-3xl px-5 py-6 text-white sm:px-8 sm:py-8"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">My school day</p><h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Everything for your school week, in one place.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/80">Keep up with your attendance, timetable, results, school announcements, and fee records.</p><Button className="mt-5 bg-white text-dashboard-ink hover:bg-white/90" asChild><Link href="/student/attendance">View attendance <ArrowRight className="size-4" /></Link></Button></section><section aria-label="Student overview" className="grid gap-3 sm:grid-cols-3"><OverviewCard label="Class & section" value={section ?? "Not enrolled"} detail="Your active placement" icon={UserRound} tone="bg-dashboard-aura text-dashboard-ink" /><OverviewCard label="Attendance rate" value={`${rate}%`} detail="Based on recorded days" icon={CalendarCheck} tone="bg-dashboard-mint text-accent-foreground" /><OverviewCard label="Fee records" value="View balances" detail="School fee information" icon={CreditCard} tone="bg-dashboard-lilac text-foreground" /></section><PortalLinks items={studentLinks} /><PortalAnnouncements href="/student/announcements" announcements={announcements} /></div>;
}

export function ParentPortalDashboard({ childrenCount, announcements }: { childrenCount: number; announcements: Announcement[] }) {
  return <div className="space-y-6 sm:space-y-8"><section className="dashboard-hero relative overflow-hidden rounded-3xl px-5 py-6 text-white sm:px-8 sm:py-8"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Family portal</p><h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">A simple window into school life.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/80">Review the school information that matters for children linked to your account.</p><Button className="mt-5 bg-white text-dashboard-ink hover:bg-white/90" asChild><Link href="/parent/attendance">View attendance <ArrowRight className="size-4" /></Link></Button></section><section aria-label="Parent overview" className="grid gap-3 sm:grid-cols-3"><OverviewCard label="Linked children" value={childrenCount} detail="Available in this portal" icon={UserRound} tone="bg-dashboard-aura text-dashboard-ink" /><OverviewCard label="Academic access" value="Read-only" detail="Published records only" icon={BookOpenCheck} tone="bg-dashboard-mint text-accent-foreground" /><OverviewCard label="Fee records" value="View balances" detail="School fee information" icon={CreditCard} tone="bg-dashboard-lilac text-foreground" /></section><PortalLinks items={parentLinks} /><PortalAnnouncements href="/parent/announcements" announcements={announcements} /></div>;
}
