import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { academicYearSchema, termSchema, timetableSchema } from "../../lib/academics/schemas";

const ids = { year: "11111111-1111-4111-8111-111111111111", assignment: "22222222-2222-4222-8222-222222222222" };

test("academic forms reject reversed dates and timetable time ranges", () => {
  assert.equal(academicYearSchema.safeParse({ name: "2026", startsOn: "2026-12-01", endsOn: "2026-01-01", status: "planned" }).success, false);
  assert.equal(termSchema.safeParse({ academicYearId: ids.year, name: "Term 1", startsOn: "2026-08-01", endsOn: "2026-08-01", status: "planned" }).success, false);
  assert.equal(timetableSchema.safeParse({ academicYearId: ids.year, assignmentId: ids.assignment, dayOfWeek: 1, startTime: "11:00", endTime: "09:00", room: "A1" }).success, false);
});

test("academic migration protects terms, assignments, and timetable conflicts", async () => {
  const [migration, rls] = await Promise.all([
    readFile(new URL("../../supabase/migrations/20260802000700_strengthen_academics_and_timetables.sql", import.meta.url), "utf8"),
    readFile(new URL("../../supabase/migrations/20260802000300_enable_row_level_security.sql", import.meta.url), "utf8"),
  ]);
  assert.match(migration, /terms_no_overlap/);
  assert.match(migration, /subjects_active_code_unique_idx/);
  assert.match(migration, /This section already has a lesson during that time/);
  assert.match(migration, /This teacher is already scheduled during that time/);
  assert.match(migration, /This room is already scheduled during that time/);
  assert.match(migration, /Timetable entry must match its teacher assignment/);
  assert.match(rls, /teacher_assignments_read_scoped/);
  assert.match(rls, /timetable_read_scoped/);
  assert.match(rls, /can_view_section\(section_id, academic_year_id\)/);
});
