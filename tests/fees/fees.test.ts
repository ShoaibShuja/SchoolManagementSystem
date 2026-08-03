import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { calculateFeeStatus } from "../../lib/fees/calculations";

test("fee status handles unpaid, partial, paid, and overdue balances", () => {
  assert.equal(calculateFeeStatus(100, 0, "2026-08-10", "2026-08-03"), "unpaid");
  assert.equal(calculateFeeStatus(100, 40, "2026-08-10", "2026-08-03"), "partially_paid");
  assert.equal(calculateFeeStatus(100, 100, "2026-01-01", "2026-08-03"), "paid");
  assert.equal(calculateFeeStatus(100, 0, "2026-01-01", "2026-08-03"), "overdue");
});
test("database payment workflow prevents overpayment and requires administrators", () => {
  const migration = readFileSync("supabase/migrations/20260803001000_complete_fee_management_and_reports.sql", "utf8");
  const integrity = readFileSync("supabase/migrations/20260802000200_add_integrity_and_security_helpers.sql", "utf8");
  assert.match(migration, /Only administrators can record payments/);
  assert.match(integrity, /Fee payments cannot exceed the amount due/);
  assert.match(migration, /refresh_fee_record_status/);
});
test("student and parent fee reads remain scoped through protected helpers", () => {
  const source = readFileSync("lib/fees/data.ts", "utf8");
  assert.match(source, /requireRole\("student"\)/);
  assert.match(source, /requireRole\("parent"\)/);
  assert.match(source, /parent_student_links/);
});
test("dashboard includes fee and announcement operational metrics", () => {
  const source = readFileSync("lib/admin/data.ts", "utf8");
  assert.match(source, /pendingFees/);
  assert.match(source, /announcements/);
});
