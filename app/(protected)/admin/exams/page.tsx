import { ExamManagement } from "@/components/results/exam-management";
import { AppShell } from "@/components/shell/app-shell";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHeader } from "@/components/shared/page-header";
import { requireRole } from "@/lib/auth/guards";
import { getExamSetup } from "@/lib/results/data";
export const metadata = { title: "Exams and results" };
export default async function AdminExamsPage() { await requireRole("admin"); const setup = await getExamSetup(); return <AppShell role="admin"><div className="space-y-6"><Breadcrumbs items={[{ label: "Admin", href: "/admin" }, { label: "Exams and results" }]} /><PageHeader eyebrow="Assessment" title="Exams and result publication" description="Set subject papers, monitor grade entry, and publish only complete results." /><ExamManagement initialData={setup} /></div></AppShell>; }
