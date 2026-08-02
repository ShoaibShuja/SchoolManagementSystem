import type { AttendanceStatus, AttendanceSummary } from "@/lib/attendance/types";

export function buildAttendanceSummary(statuses: AttendanceStatus[]): AttendanceSummary {
  const summary = { total: statuses.length, present: 0, absent: 0, late: 0, excused: 0, rate: 0 };
  statuses.forEach((status) => { summary[status] += 1; });
  summary.rate = summary.total ? Math.round(((summary.present + summary.late + summary.excused) / summary.total) * 100) : 0;
  return summary;
}
