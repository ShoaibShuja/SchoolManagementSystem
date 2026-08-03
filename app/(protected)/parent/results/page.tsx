import { ParentResultsView } from "@/components/results/result-cards";
import { AppShell } from "@/components/shell/app-shell";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHeader } from "@/components/shared/page-header";
import { requireRole } from "@/lib/auth/guards";
import { getParentResults } from "@/lib/results/data";
export const metadata = { title: "Children's results" };
export default async function ParentResultsPage() { await requireRole("parent"); const bundles = await getParentResults(); return <AppShell role="parent"><div className="space-y-6"><Breadcrumbs items={[{ label: "Parent", href: "/parent" }, { label: "Results" }]} /><PageHeader eyebrow="Family portal" title="Published results" description="Choose a linked child to see only their published results and report cards." /><ParentResultsView bundles={bundles} /></div></AppShell>; }
