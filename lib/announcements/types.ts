import type { AppRole } from "@/lib/constants/roles";
export type AnnouncementStatus = "draft" | "published" | "archived";
export type Announcement = { id: string; title: string; body: string; status: AnnouncementStatus; audienceLabel: string; target: AnnouncementTarget; targetIds: string[]; publishedOn: string | null; expiresOn: string | null; createdAt: string; updatedAt: string; authorId: string };
export type AnnouncementTarget = "all" | "role" | "class" | "section" | "academicYear";
export type AnnouncementForm = { title: string; body: string; status: AnnouncementStatus; target: AnnouncementTarget; targetIds: string[]; publishedOn: string; expiresOn: string };
export type AnnouncementSetup = { announcements: Announcement[]; roles: AppRole[]; classes: { id: string; name: string }[]; sections: { id: string; label: string }[]; academicYears: { id: string; name: string; label: string }[]; teacherSections: { id: string; label: string }[]; isAdmin: boolean };
