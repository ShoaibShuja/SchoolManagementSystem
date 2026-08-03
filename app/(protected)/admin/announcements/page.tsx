import { AnnouncementManagement } from "@/components/announcements/announcement-management";
import { AppShell } from "@/components/shell/app-shell";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHeader } from "@/components/shared/page-header";
import { getAnnouncementSetup } from "@/lib/announcements/data";
import { requireRole } from "@/lib/auth/guards";
export const metadata = { title: "Announcements" };
export default async function Page() { await requireRole("admin"); const setup = await getAnnouncementSetup(); return <AppShell role="admin"><div className="space-y-6"><Breadcrumbs items={[{ label: "Admin", href: "/admin" }, { label: "Announcements" }]} /><PageHeader eyebrow="Communication" title="Announcements" description="Publish clear updates to the right school audience." /><AnnouncementManagement initialData={setup} /></div></AppShell>; }
