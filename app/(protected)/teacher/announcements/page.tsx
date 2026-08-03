import { AnnouncementManagement } from "@/components/announcements/announcement-management";
import { AppShell } from "@/components/shell/app-shell";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHeader } from "@/components/shared/page-header";
import { getAnnouncementSetup } from "@/lib/announcements/data";
import { requireRole } from "@/lib/auth/guards";
export const metadata = { title: "Announcements" };
export default async function Page() { await requireRole("teacher"); const setup = await getAnnouncementSetup(); return <AppShell role="teacher"><div className="space-y-6"><Breadcrumbs items={[{ label: "Teacher", href: "/teacher" }, { label: "Announcements" }]} /><PageHeader eyebrow="Communication" title="Section announcements" description="Create updates only for sections assigned to you." /><AnnouncementManagement initialData={setup} /></div></AppShell>; }
