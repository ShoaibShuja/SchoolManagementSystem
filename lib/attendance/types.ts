export const attendanceStatuses = ["present", "absent", "late", "excused"] as const;
export type AttendanceStatus = (typeof attendanceStatuses)[number];
export type AttendanceRosterStudent = { id: string; name: string; admissionNumber: string; status: AttendanceStatus; remarks: string; existing: boolean };
export type AttendanceSection = { id: string; name: string; className: string; academicYearId: string; academicYearName: string };
export type AttendanceRecord = { id: string; studentId: string; studentName: string; admissionNumber: string; sectionName: string; className: string; academicYearName: string; date: string; status: AttendanceStatus; remarks: string | null; markedBy: string };
export type AttendanceSummary = { total: number; present: number; absent: number; late: number; excused: number; rate: number };
export type PersonalAttendance = { studentName: string; section: string | null; summary: AttendanceSummary; recent: AttendanceRecord[] };
export type ParentChildAttendance = PersonalAttendance & { studentId: string };
