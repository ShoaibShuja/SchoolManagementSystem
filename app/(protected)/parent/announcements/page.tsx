import { AnnouncementList } from "@/components/announcements/announcement-list";
import { AppShell } from "@/components/shell/app-shell";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHeader } from "@/components/shared/page-header";
import { getVisibleAnnouncements } from "@/lib/announcements/data";
import { requireRole } from "@/lib/auth/guards";
export const metadata = { title: "Announcements" };
export default async function Page() { await requireRole("parent"); const announcements = await getVisibleAnnouncements(50); return <AppShell role="parent"><div className="space-y-6"><Breadcrumbs items={[{ label: "Parent", href: "/parent" }, { label: "Announcements" }]} /><PageHeader eyebrow="Family portal" title="Announcements" description="Updates relevant to your family." /><AnnouncementList announcements={announcements} /></div></AppShell>; }
