import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("enrollment migration protects one active placement and section capacity", async () => {
  const [foundation, migration] = await Promise.all([
    readFile(new URL("../../supabase/migrations/20260802000100_create_school_schema.sql", import.meta.url), "utf8"),
    readFile(new URL("../../supabase/migrations/20260802000500_support_admin_record_management.sql", import.meta.url), "utf8"),
  ]);
  assert.match(foundation, /student_enrollments_one_active_year_idx/);
  assert.match(migration, /validate_section_capacity/);
  assert.match(migration, /transfer_student_enrollment/);
  assert.match(migration, /Only an administrator can transfer a student enrollment/);
});
