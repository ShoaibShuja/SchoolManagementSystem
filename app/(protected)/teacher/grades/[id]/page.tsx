import { GradebookEditor } from "@/components/results/gradebook-editor";
import { AppShell } from "@/components/shell/app-shell";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHeader } from "@/components/shared/page-header";
import { requireRole } from "@/lib/auth/guards";
import { getTeacherGradebook } from "@/lib/results/data";
export const metadata = { title: "Gradebook" };
export default async function GradebookPage({ params }: { params: Promise<{ id: string }> }) { await requireRole("teacher"); const { id } = await params; const gradebook = await getTeacherGradebook(id); return <AppShell role="teacher"><div className="space-y-6"><Breadcrumbs items={[{ label: "Teacher", href: "/teacher" }, { label: "Gradebooks", href: "/teacher/grades" }, { label: gradebook.examSubject.subjectName }]} /><PageHeader eyebrow="Assessment" title="Grade entry" description="Save work in draft or open status. Marks are checked against the paper maximum." /><GradebookEditor initialData={gradebook} /></div></AppShell>; }
