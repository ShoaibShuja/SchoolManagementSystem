import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path: string) {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("hardening migration makes fee and teacher announcement writes authoritative", async () => {
  const [migration, storagePolicies] = await Promise.all([
    source("supabase/migrations/20260804001100_harden_privileged_workflows.sql"),
    source("supabase/migrations/20260802000400_create_private_storage_policies.sql"),
  ]);
  assert.doesNotMatch(migration, /\0/);
  assert.match(migration, /drop policy if exists admin_manage_fee_records/);
  assert.match(migration, /drop policy if exists admin_manage_fee_payments/);
  assert.match(migration, /record_fee_payment[\s\S]*security definer/);
  assert.match(migration, /for update/);
  assert.match(migration, /drop policy if exists announcements_insert_authorized/);
  assert.match(migration, /save_announcement[\s\S]*security definer/);
  assert.doesNotMatch(migration, /storage\.objects/);
  assert.match(storagePolicies, /owner_id = \(select auth\.uid\(\)::text\)/);
});

test("integrity migration serializes critical writes and preserves grade history", async () => {
  const migration = await source("supabase/migrations/20260804001200_strengthen_data_integrity.sql");
  assert.match(migration, /create_student_with_guardian/);
  assert.match(migration, /for update;/);
  assert.match(migration, /Grade entries are retained for academic history/);
  assert.match(migration, /Only draft or open exam grades can be changed/);
  assert.match(migration, /for update of e/);
});

test("expensive exports validate identifiers, throttle requests, and avoid public caching", async () => {
  const [reportRoute, rateLimit, config] = await Promise.all([
    source("app/api/results/[examId]/report-card/route.ts"),
    source("lib/api/route-security.ts"),
    source("next.config.ts"),
  ]);
  assert.match(reportRoute, /z\.uuid/);
  assert.match(reportRoute, /enforceRateLimit/);
  assert.match(reportRoute, /Cache-Control.*private, no-store/);
  assert.match(rateLimit, /Too many requests/);
  assert.match(config, /Content-Security-Policy/);
});
