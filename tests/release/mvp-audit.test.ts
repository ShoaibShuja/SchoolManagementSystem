import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path: string) { return readFile(new URL(`../../${path}`, import.meta.url), "utf8"); }

test("demo seed remains non-personal and satisfies the teacher record contract", async () => {
  const seed = await source("supabase/seed.sql");
  assert.match(seed, /example\.invalid/);
  assert.match(seed, /first_name, last_name, phone, email, qualification/);
  assert.match(seed, /Demonstration record/);
  assert.match(seed, /create table public\.jahan_demo_seed_refs/);
  assert.match(seed, /drop table public\.jahan_demo_seed_refs/);
  assert.doesNotMatch(seed, /create temporary table jahan_demo_seed_refs/);
});

test("grade-entry validation uses an unambiguous academic-year variable", async () => {
  const migration = await source("supabase/migrations/20260806001300_fix_grade_entry_validation.sql");
  assert.match(migration, /exam_academic_year_id uuid/);
  assert.match(migration, /se\.academic_year_id = exam_academic_year_id/);
  assert.doesNotMatch(migration, /se\.academic_year_id = academic_year_id/);
});

test("protected role pages and attendance APIs enforce their intended scope", async () => {
  const [teacherPage, studentPage, parentPage, adminApi, teacherApi] = await Promise.all([
    source("app/(protected)/teacher/attendance/page.tsx"), source("app/(protected)/student/attendance/page.tsx"), source("app/(protected)/parent/attendance/page.tsx"), source("app/api/attendance/admin/route.ts"), source("app/api/attendance/teacher/route.ts"),
  ]);
  assert.match(teacherPage, /requireRole\("teacher"\)/);
  assert.match(studentPage, /requireRole\("student"\)/);
  assert.match(parentPage, /requireRole\("parent"\)/);
  assert.match(adminApi, /requireAttendanceApi\(\["admin"\]\)/);
  assert.match(teacherApi, /requireAttendanceApi\(\["teacher"\]\)/);
});

test("RLS, private service credentials, and direct route guards remain present", async () => {
  const [rls, adminClient, protectedLayout, profile] = await Promise.all([
    source("supabase/migrations/20260802000300_enable_row_level_security.sql"), source("lib/supabase/admin.ts"), source("app/(protected)/layout.tsx"), source("lib/auth/profile.ts"),
  ]);
  assert.match(rls, /'attendance_records'/);
  assert.match(rls, /alter table public\.%I enable row level security/i);
  assert.match(rls, /attendance_read_scoped/);
  assert.match(rls, /attendance_insert_assigned/);
  assert.match(adminClient, /server-only/);
  assert.match(protectedLayout, /requireCurrentProfile/);
  assert.doesNotMatch(profile, /SUPABASE_SERVICE_ROLE_KEY/);
});
