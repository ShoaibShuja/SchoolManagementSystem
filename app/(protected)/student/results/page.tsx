import { StudentResultsView } from "@/components/results/result-cards";
import { AppShell } from "@/components/shell/app-shell";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHeader } from "@/components/shared/page-header";
import { requireRole } from "@/lib/auth/guards";
import { getOwnResults } from "@/lib/results/data";
export const metadata = { title: "My results" };
export default async function StudentResultsPage() { await requireRole("student"); const bundle = await getOwnResults(); return <AppShell role="student"><div className="space-y-6"><Breadcrumbs items={[{ label: "Student", href: "/student" }, { label: "Results" }]} /><PageHeader eyebrow="My school" title="My published results" description="Draft results are not visible here. Download a report card for each published exam." /><StudentResultsView bundle={bundle} /></div></AppShell>; }
