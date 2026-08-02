import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { examSubjectSchema, gradeSaveSchema } from "../../lib/results/schemas";

const id = "11111111-1111-4111-8111-111111111111";

test("exam and grade schemas enforce mark limits and valid grade states", () => {
  assert.equal(examSubjectSchema.safeParse({ examId: id, sectionId: id, subjectId: id, examDate: "2026-09-01", maximumMarks: 50, passingMarks: 51 }).success, false);
  assert.equal(gradeSaveSchema.safeParse({ records: [{ studentId: id, marks: null, status: "graded", remarks: "" }] }).success, false);
  assert.equal(gradeSaveSchema.safeParse({ records: [{ studentId: id, marks: 10, status: "absent", remarks: "" }] }).success, false);
});

test("grade workflow migration protects teacher scope, publication, audit history, and isolation", async () => {
  const [migration, rls, helpers, pdf] = await Promise.all([
    readFile(new URL("../../supabase/migrations/20260802000800_add_exam_gradebook_and_publication_workflows.sql", import.meta.url), "utf8"),
    readFile(new URL("../../supabase/migrations/20260802000300_enable_row_level_security.sql", import.meta.url), "utf8"),
    readFile(new URL("../../supabase/migrations/20260802000200_add_integrity_and_security_helpers.sql", import.meta.url), "utf8"),
    readFile(new URL("../../components/results/report-card-document.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(migration, /grade_entry_audits/);
  assert.match(migration, /Published results are locked and cannot be changed/);
  assert.match(migration, /private\.can_manage_grade\(requested_exam_subject_id, r\.student_id\)/);
  assert.match(migration, /Enter a grade, absence, or exemption for every enrolled student before publishing/);
  assert.match(migration, /e\.status = 'published'/);
  assert.match(rls, /grades_insert_assigned/);
  assert.match(helpers, /private\.can_access_student\(requested_student_id\)/);
  assert.match(helpers, /p\.profile_id = \(select auth\.uid\(\)\)/);
  assert.match(pdf, /result\.report\.subjects/);
  assert.doesNotMatch(pdf, /calculateReport\(/);
});
