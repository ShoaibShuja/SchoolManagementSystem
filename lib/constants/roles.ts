import { BookOpenCheck, CalendarCheck, GraduationCap, LayoutDashboard, Users, type LucideIcon } from "lucide-react";

export const roles = ["admin", "teacher", "student", "parent"] as const;
export type AppRole = (typeof roles)[number];

export type NavigationItem = { href: string; label: string; icon: LucideIcon };

export const roleNavigation: Record<AppRole, NavigationItem[]> = {
  admin: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/students", label: "Students", icon: Users },
    { href: "/admin/attendance", label: "Attendance", icon: CalendarCheck },
  ],
  teacher: [
    { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
    { href: "/teacher/classes", label: "My classes", icon: Users },
    { href: "/teacher/attendance", label: "Attendance", icon: CalendarCheck },
  ],
  student: [
    { href: "/student", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/attendance", label: "Attendance", icon: CalendarCheck },
    { href: "/student/results", label: "Results", icon: BookOpenCheck },
  ],
  parent: [
    { href: "/parent", label: "Dashboard", icon: LayoutDashboard },
    { href: "/parent/children", label: "Children", icon: GraduationCap },
    { href: "/parent/announcements", label: "Announcements", icon: BookOpenCheck },
  ],
};
