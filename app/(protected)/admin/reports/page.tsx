import Link from "next/link";
import { FeeList } from "@/components/fees/fee-list";
import { AppShell } from "@/components/shell/app-shell";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHeader } from "@/components/shared/page-header";
import { requireRole } from "@/lib/auth/guards";
import { listAdminFees } from "@/lib/fees/data";
export const metadata = { title: "Operational reports" };
export default async function ReportsPage() { await requireRole("admin"); const fees = await listAdminFees({ page: 1, pageSize: 15 }); return <AppShell role="admin"><div className="space-y-6"><Breadcrumbs items={[{ label: "Admin", href: "/admin" }, { label: "Reports" }]} /><PageHeader eyebrow="Operations" title="Practical reports" description="Use the focused operational views below. They respect the same server-side access controls as their source records." /><section className="grid gap-4 md:grid-cols-2"><Link href="/admin/attendance" className="rounded-lg border bg-card p-5"><h2 className="font-semibold">Attendance summary</h2><p className="mt-2 text-sm text-muted-foreground">Filter by date, section, student, academic year, and attendance status.</p></Link><Link href="/admin/exams" className="rounded-lg border bg-card p-5"><h2 className="font-semibold">Examination results summary</h2><p className="mt-2 text-sm text-muted-foreground">Review exam setup, publication status, subject papers, and grade entry totals.</p></Link></section><section className="space-y-3"><div><h2 className="font-semibold">Fee status summary</h2><p className="mt-1 text-sm text-muted-foreground">The latest fee records, sorted by due date. Use fee management to filter and record payments.</p></div><FeeList fees={fees.items} showStudent /></section></div></AppShell>; }
