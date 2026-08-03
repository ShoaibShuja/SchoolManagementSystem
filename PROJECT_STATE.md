# Project State

## Production release status

Source release candidate complete. **Do not deploy to production yet.** Release approval requires the live verification gates below in a disposable Supabase project and Vercel Preview, followed by a production smoke test.

## Branch and release commits

- Final branch: `release/v1-production`
- Release code baseline: `2b3d21c` (`chore: update release dependencies`)
- Handover documentation: this release branch after the final documentation commit

## Feature summary

- Fixed Admin, Teacher, Student, and Parent roles with server authorization and Supabase RLS.
- Student and teacher records; classes, sections, academic years, terms, subjects, assignments, and enrollments.
- Attendance, timetable, exams, gradebooks, published results, private PDF report cards, and announcements.
- Read-only student and linked-child parent portals.
- Admin-only manual fee records and payment history, including overpayment prevention and due-date-aware statuses.
- Admin dashboard with active totals, attendance rate, fee status, and announcements.

Excluded features remain excluded: online payments, library, transport, hostel, payroll/full HR, inventory, multi-school, LMS, video conferencing, SMS, biometric/RFID attendance, AI, predictive analytics, native apps, configurable permissions, and i18n.

## Migration status

- Source migrations: present and ordered from `20260802000100_create_school_schema.sql` through `20260804001200_strengthen_data_integrity.sql`.
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
- Live migration/pgTAP, Auth/RLS/Storage isolation, browser E2E, accessibility scan, mobile visual QA, and deployment smoke testing: pending a disposable environment and fictional accounts.

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

Provision a disposable Supabase project and Vercel Preview; apply migrations 001-012; execute pgTAP, RLS/Storage isolation, fictional-account Playwright, accessibility, mobile visual, and rollback smoke tests. Approve production only when each gate has recorded evidence.
