import { FeeList } from "@/components/fees/fee-list";
import { AppShell } from "@/components/shell/app-shell";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHeader } from "@/components/shared/page-header";
import { requireRole } from "@/lib/auth/guards";
import { getOwnFees } from "@/lib/fees/data";
export const metadata = { title: "My fees" };
export default async function StudentFeesPage() { await requireRole("student"); const data = await getOwnFees(); return <AppShell role="student"><div className="space-y-6"><Breadcrumbs items={[{ label: "Student", href: "/student" }, { label: "Fees" }]} /><PageHeader eyebrow="My school" title="My fee records" description="Your recorded balances and payment history. Contact the school office for corrections." /><FeeList fees={data.fees} /></div></AppShell>; }
