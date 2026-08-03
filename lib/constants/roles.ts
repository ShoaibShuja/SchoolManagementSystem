import { BookOpenCheck, CalendarCheck, GraduationCap, LayoutDashboard, School, Users, type LucideIcon } from "lucide-react";

export const roles = ["admin", "teacher", "student", "parent"] as const;
export type AppRole = (typeof roles)[number];

export type NavigationItem = { href: string; label: string; icon: LucideIcon };

export const roleNavigation: Record<AppRole, NavigationItem[]> = {
  admin: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/students", label: "Students", icon: Users },
    { href: "/admin/teachers", label: "Teachers", icon: GraduationCap },
    { href: "/admin/classes", label: "Classes", icon: School },
    { href: "/admin/academics", label: "Academic setup", icon: BookOpenCheck },
    { href: "/admin/exams", label: "Exams and results", icon: BookOpenCheck },
    { href: "/admin/attendance", label: "Attendance", icon: CalendarCheck },
  ],
  teacher: [
    { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
    { href: "/teacher/academics", label: "My teaching", icon: Users },
    { href: "/teacher/grades", label: "Gradebooks", icon: BookOpenCheck },
    { href: "/teacher/attendance", label: "Attendance", icon: CalendarCheck },
  ],
  student: [
    { href: "/student", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/attendance", label: "Attendance", icon: CalendarCheck },
    { href: "/student/timetable", label: "Timetable", icon: School },
    { href: "/student/results", label: "Results", icon: BookOpenCheck },
  ],
  parent: [
    { href: "/parent", label: "Dashboard", icon: LayoutDashboard },
    { href: "/parent/children", label: "Children", icon: GraduationCap },
    { href: "/parent/attendance", label: "Attendance", icon: CalendarCheck },
    { href: "/parent/timetable", label: "Timetables", icon: School },
    { href: "/parent/results", label: "Results", icon: BookOpenCheck },
    { href: "/parent/announcements", label: "Announcements", icon: BookOpenCheck },
  ],
};
