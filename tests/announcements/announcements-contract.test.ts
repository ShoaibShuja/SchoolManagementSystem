import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { announcementSchema } from "../../lib/announcements/schemas";

const id = "11111111-1111-4111-8111-111111111111";
test("announcement input requires valid targets and publication dates", () => {
  assert.equal(announcementSchema.safeParse({ title: "Update", body: "Body", status: "published", target: "section", targetIds: [], publishedOn: "", expiresOn: "" }).success, false);
  assert.equal(announcementSchema.safeParse({ title: "Update", body: "Body", status: "published", target: "section", targetIds: [id], publishedOn: "2026-09-02", expiresOn: "2026-09-01" }).success, false);
});
test("announcement migration scopes teachers and hides unpublished or expired updates", async () => {
  const [migration, helpers] = await Promise.all([readFile(new URL("../../supabase/migrations/20260803000900_secure_announcements_and_portals.sql", import.meta.url), "utf8"), readFile(new URL("../../supabase/migrations/20260802000200_add_integrity_and_security_helpers.sql", import.meta.url), "utf8")]);
  assert.match(migration, /Teachers may target only one or more assigned sections/);
  assert.match(migration, /private\.has_teacher_assignment\(section_id, null, null\)/);
  assert.match(migration, /announcement_academic_year_audiences/);
  assert.match(migration, /a\.status = 'published'/);
  assert.match(migration, /a\.expires_at is null or a\.expires_at > timezone/);
  assert.match(helpers, /p\.profile_id = \(select auth\.uid\(\)\)/);
});
test("email delivery remains optional and non-blocking", async () => { const email = await readFile(new URL("../../lib/announcements/email.ts", import.meta.url), "utf8"); assert.match(email, /RESEND_API_KEY/); assert.match(email, /reason: "disabled"/); assert.match(email, /attempted: false/); });
