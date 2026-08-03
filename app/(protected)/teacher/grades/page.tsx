import Link from "next/link";
import { AppShell } from "@/components/shell/app-shell";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/guards";
import { getTeacherGradebooks } from "@/lib/results/data";
export const metadata = { title: "My gradebooks" };
export default async function TeacherGradesPage() { await requireRole("teacher"); const gradebooks = await getTeacherGradebooks(); return <AppShell role="teacher"><div className="space-y-6"><Breadcrumbs items={[{ label: "Teacher", href: "/teacher" }, { label: "Gradebooks" }]} /><PageHeader eyebrow="Assessment" title="My gradebooks" description="Only assigned subjects and sections appear here. Published results cannot be edited." /><div className="grid gap-3 md:grid-cols-2">{gradebooks.map((book) => <article key={book.id} className="rounded-lg border bg-card p-4"><p className="font-semibold">{book.examName} · {book.subjectName}</p><p className="mt-1 text-sm text-muted-foreground">{book.className}/Section {book.sectionName} · {book.examDate}</p><p className="mt-1 text-xs text-muted-foreground">{book.status} · {book.gradeCount} grades entered</p><Button asChild className="mt-4" size="sm"><Link href={`/teacher/grades/${book.id}`}>{book.status === "published" ? "View gradebook" : "Enter grades"}</Link></Button></article>)}{gradebooks.length === 0 ? <p className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">No gradebooks are assigned to you yet.</p> : null}</div></div></AppShell>; }
