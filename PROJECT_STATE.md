# Project State

## Production release status

Source release candidate complete. **Do not deploy to production yet.** Release approval requires the live verification gates below in a disposable Supabase project and Vercel Preview, followed by a production smoke test.

## Current phase

- Current phase: fictional demo-data seed complete in source; ready for disposable Supabase validation alongside the existing release gates.
- Last completed prompt: create a medium-high volume fictional Afghan school seed for every scoped module.
- In progress: validate the new seed against a disposable Supabase project. Live Supabase, browser E2E, accessibility, responsive visual, backup/restore, and deployment verification remain pending.

## Branch and release commits

- Current branch: `feat/afghan-school-demo-seed`
- Last code merge: `d217248` (`Merge pull request #15 from ShoaibShuja/feat/dashboard-visual-refresh`)
- Current feature commit: `4104219` (`feat: add persistent dark mode`)
- Release code baseline: `2b3d21c` (`chore: update release dependencies`)
- Handover documentation: `b41e7a9` and `c7fc8e1`.

## Latest important changes

- Dashboard visual refresh: refreshed the authenticated shell and Admin, Teacher, Student, and Parent dashboards with centralized semantic dashboard tokens, a responsive briefing layout, colorful metric cards, and touch-friendly shortcut cards. Existing role scopes, API contracts, and server-rendered data access are unchanged.
- Persistent color theme: added a token-driven premium dark palette and an accessible light/dark toggle in signed-in and public access screens. The first visit follows the device preference; an explicit choice is saved in browser storage as `jahan-color-theme` and applied before rendering to avoid a color flash.
- Fictional demo seed: replaced the minimal local seed with a SQL Editor-ready, repeatable fictional Afghan school dataset. It covers fixed-role Auth accounts, Grade 7-9 academic setup, 48 students and guardians, eight teachers, enrollment, assignments, conflict-free timetable lessons, attendance, published and draft gradebooks, fee records/payments, and announcements. It is explicitly limited to disposable development or Preview projects.
- `432c341` / `7ab2f3d`: kept migration 011 limited to privileged fee and announcement workflows; private Storage policies remain in migration 004.
- `5251efe` / `ef7a114`: corrected the Storage policy owner-id cast.
- `b33cf57`: allows React's development-only CSP evaluation without adding `'unsafe-eval'` to production.

## Feature summary

- Fixed Admin, Teacher, Student, and Parent roles with server authorization and Supabase RLS.
- Student and teacher records; classes, sections, academic years, terms, subjects, assignments, and enrollments.
- Attendance, timetable, exams, gradebooks, published results, private PDF report cards, and announcements.
- Read-only student and linked-child parent portals.
- Admin-only manual fee records and payment history, including overpayment prevention and due-date-aware statuses.
- Admin dashboard with active totals, attendance rate, fee status, and announcements.

Excluded features remain excluded: online payments, library, transport, hostel, payroll/full HR, inventory, multi-school, LMS, video conferencing, SMS, biometric/RFID attendance, AI, predictive analytics, native apps, configurable permissions, and i18n.

## Migration status

- Source migrations: present and ordered from `20260802000100_create_school_schema.sql` through `20260804001200_strengthen_data_integrity.sql`. Storage buckets and policies belong exclusively to migration `20260802000400_create_private_storage_policies.sql`; `20260804001100_harden_privileged_workflows.sql` contains only fee and announcement workflow hardening.
- Live status: unverified. Apply all 12 migrations only in timestamp order; never edit an applied migration.
- pgTAP gates: `supabase/tests/database_foundation.test.sql` and `supabase/tests/production_hardening.test.sql`; execution requires a linked disposable Supabase database.

## Test status, 2026-08-04

- `npm ci --ignore-scripts`: passed; 0 vulnerabilities reported.
- `npm audit --omit=dev`: passed; 0 vulnerabilities.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 28/28 tests.
- `npm run test:e2e -- --list`: passed; 3 role-access tests collected.
- `npm run build`: passed with Next.js 16.3.0.
- Dashboard visual-refresh checks on 2026-08-04: `npm run lint`, `npm run typecheck`, `npm run test` (28/28), and `npm run build` all passed.
- Dark-mode checks on 2026-08-04: `npm run lint`, `npm run typecheck`, `npm run test` (28/28), and `npm run build` passed. A local Chrome mobile check at 390px confirmed dark-mode persistence through a page reload.
- Demo-seed source checks on 2026-08-04: `git diff --check`, `npm run lint`, `npm run typecheck`, `npm run test` (28/28), and `npm run build` passed. SQL execution is still pending a disposable Supabase database.
- `20260804001100_harden_privileged_workflows.sql` was statically checked after removing its redundant Storage policy redefinition; live migration verification remains pending a linked disposable database.
- Development CSP allows React's required `'unsafe-eval'` only when `NODE_ENV=development`; production does not include it.
- Live migration/pgTAP, Auth/RLS/Storage isolation, browser E2E, accessibility scan, mobile visual QA, and deployment smoke testing: pending a disposable environment and fictional accounts.
- The expanded `supabase/seed.sql` has source-level validation only. Execute it in a disposable Supabase project after migrations 001-012 and record the SQL Editor confirmation counts before relying on it for browser testing.

## Deployment status

- `vercel.json` and GitHub Actions are present and source-reviewed.
- Configure separate Supabase projects and environment values for Preview and Production. Public `NEXT_PUBLIC_*` values are embedded at build time and must match the target environment.
- Before launch, configure Supabase Auth redirect URLs, private Storage buckets, Vercel Firewall rate limits for report-card and invitation endpoints, backups/PITR, and the custom domain.

## Known limitations and maintenance priorities

1. Complete the pending live release gates before approving production.
2. Process-local API throttling is supplementary only; retain Vercel Firewall controls.
3. Announcement email is intentionally inactive until recipient, opt-out, retry, and abuse policies are approved.
4. Review dependencies monthly, back up before every migration or bulk change, and test restore quarterly.

## Recommended next action

Provision a disposable Supabase project and Vercel Preview; apply migrations 001-012 and `supabase/seed.sql`; execute pgTAP, RLS/Storage isolation, fictional-account Playwright, accessibility, mobile visual, and rollback smoke tests. Approve production only when each gate has recorded evidence.
