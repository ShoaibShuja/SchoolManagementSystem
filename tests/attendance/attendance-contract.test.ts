import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { attendanceSaveSchema } from "../../lib/attendance/schemas";
import { buildAttendanceSummary } from "../../lib/attendance/utils";

const record = { studentId: "11111111-1111-4111-8111-111111111111", status: "present" as const, remarks: "" };
const input = { sectionId: "22222222-2222-4222-8222-222222222222", academicYearId: "33333333-3333-4333-8333-333333333333", date: "2026-08-02", records: [record] };

test("attendance input rejects invalid dates and empty saves", () => {
  assert.equal(attendanceSaveSchema.safeParse({ ...input, date: "not-a-date" }).success, false);
  assert.equal(attendanceSaveSchema.safeParse({ ...input, records: [] }).success, false);
});

test("attendance summaries count all approved statuses toward the rate", () => {
  const summary = buildAttendanceSummary(["present", "late", "excused", "absent"]);
  assert.deepEqual(summary, { total: 4, present: 1, absent: 1, late: 1, excused: 1, rate: 75 });
});

test("migration enforces assignment, duplicate safety, and academic-year dates", async () => {
  const [migration, rls] = await Promise.all([
    readFile(new URL("../../supabase/migrations/20260802000600_add_attendance_workflows.sql", import.meta.url), "utf8"),
    readFile(new URL("../../supabase/migrations/20260802000300_enable_row_level_security.sql", import.meta.url), "utf8"),
  ]);
  assert.match(migration, /You are not assigned to this section/);
  assert.match(migration, /on conflict \(student_id, section_id, academic_year_id, attendance_date\)/i);
  assert.match(migration, /Attendance date must fall within the academic year/);
  assert.match(rls, /attendance_read_scoped/);
  assert.match(rls, /attendance_insert_assigned/);
});
