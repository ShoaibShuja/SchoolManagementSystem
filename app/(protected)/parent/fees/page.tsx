import { FeeList } from "@/components/fees/fee-list";
import { AppShell } from "@/components/shell/app-shell";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHeader } from "@/components/shared/page-header";
import { requireRole } from "@/lib/auth/guards";
import { getParentFees } from "@/lib/fees/data";
export const metadata = { title: "Children's fees" };
export default async function ParentFeesPage() { await requireRole("parent"); const children = await getParentFees(); return <AppShell role="parent"><div className="space-y-6"><Breadcrumbs items={[{ label: "Parent", href: "/parent" }, { label: "Fees" }]} /><PageHeader eyebrow="Family portal" title="Fee records" description="Read-only balances and payment history for your linked children." />{children.length ? children.map((child) => <section key={child.studentId} className="space-y-3"><h2 className="font-semibold">{child.studentName}</h2><FeeList fees={child.fees} /></section>) : <p className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">No linked children found.</p>}</div></AppShell>; }
