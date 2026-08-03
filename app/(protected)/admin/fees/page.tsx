import { FeeManagement } from "@/components/fees/fee-management";
import { AppShell } from "@/components/shell/app-shell";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHeader } from "@/components/shared/page-header";
import { requireRole } from "@/lib/auth/guards";
import { getFeeSetup, listAdminFees } from "@/lib/fees/data";
export const metadata = { title: "Fee management" };
export default async function FeesPage() { await requireRole("admin"); const [setup, fees] = await Promise.all([getFeeSetup(), listAdminFees({ page: 1, pageSize: 15 })]); return <AppShell role="admin"><div className="space-y-6"><Breadcrumbs items={[{ label: "Admin", href: "/admin" }, { label: "Fees" }]} /><PageHeader eyebrow="Operations" title="Manual fee records" description="Create fee records and record manual payments. No online payments are processed." /><FeeManagement initialSetup={setup} initialFees={fees} /></div></AppShell>; }
