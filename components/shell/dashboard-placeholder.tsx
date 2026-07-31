import type { AppRole } from "@/lib/constants/roles";
import { EmptyState } from "@/components/shared/states";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHeader } from "@/components/shared/page-header";

const content: Record<AppRole, { title: string; description: string; emptyTitle: string; emptyDescription: string }> = {
  admin: { title: "Admin dashboard", description: "Monitor the school’s daily operations from one workspace.", emptyTitle: "Your dashboard is ready", emptyDescription: "Student records, teacher records, classes, and attendance will appear here as the MVP modules are added." },
  teacher: { title: "Teacher dashboard", description: "Keep your assigned classes and attendance tasks in one place.", emptyTitle: "No class information yet", emptyDescription: "Your assigned classes and daily attendance tasks will appear here after academic setup is complete." },
  student: { title: "Student dashboard", description: "View your school information in one clear place.", emptyTitle: "Your portal is being prepared", emptyDescription: "Attendance, timetable, and results will be added in a later delivery stage." },
  parent: { title: "Parent dashboard", description: "Stay informed about your child’s school progress.", emptyTitle: "Your portal is being prepared", emptyDescription: "Linked child information, attendance, results, and fee records will be added in a later delivery stage." },
};

export function DashboardPlaceholder({ role }: { role: AppRole }) {
  const page = content[role];
  const roleLabel = role[0].toUpperCase() + role.slice(1);
  return <div className="space-y-6"><Breadcrumbs items={[{ label: roleLabel }, { label: "Dashboard" }]} /><PageHeader eyebrow="Dashboard" title={page.title} description={page.description} /><EmptyState title={page.emptyTitle} description={page.emptyDescription} /></div>;
}
