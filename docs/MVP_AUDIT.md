# MVP release audit

## Local result

On 2026-08-02, the release branch passed `npm run test` (13 tests), `npm run lint`, `npm run typecheck`, and `npm run build`. Static contract checks cover route and API guards, RLS-policy presence, server-only service credentials, safe demo seed records, record filtering, form validation, and enrollment and attendance constraints.

This is not a production-release approval. A local Windows runtime cannot apply the Supabase migrations or execute pgTAP, real Auth, Storage, or RLS isolation checks.

## Live Supabase release checklist

Use a separate demonstration project and apply migrations through `20260802000600_add_attendance_workflows.sql` before checking the following.

- Sign in and sign out with an account for each fixed role. Confirm `/dashboard` redirects to that role's dashboard.
- As an admin, create, edit, deactivate, search, filter, enroll, transfer, and view student and teacher records. Confirm invalid dates, duplicate active enrollments, full sections, and deletions with dependencies are rejected.
- As an assigned teacher, mark a section's attendance, use **All present**, correct one record, and save again. Confirm an unassigned section cannot be read or saved and a second daily save updates rather than duplicates records.
- As an admin, filter and correct attendance. Confirm the recorded marker is visible and the daily attendance rate is accurate.
- As a student, attempt direct URLs and API requests for another student's records. Confirm access is denied and own attendance remains read-only.
- As a parent, test only linked children, then attempt an unrelated child through the page and API. Confirm access is denied.
- Confirm anonymous direct access to protected pages and APIs redirects or returns an authorization error. Confirm role changes in browser input cannot elevate access.
- Test the optional profile image upload with an authorized linked student only. Confirm the private object cannot be read through a public URL.
- Execute the pgTAP tests in `supabase/tests/` and record the results with the release evidence.

## Demonstration data

`supabase/seed.sql` contains only clearly labelled fictional records using the reserved `.invalid` domain. It includes sample classes, sections, enrollments, a teacher, guardians, and attendance records. The seeded Auth identities do not have usable passwords. Never run this seed in production or use real personal data for a demonstration.

## Post-MVP modules

Timetables, gradebooks/results, report cards, announcements, and fee management remain outside this MVP release. Their schema foundations do not mean that their user interfaces or operational workflows are available.
