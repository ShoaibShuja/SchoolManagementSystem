# Project State

## Current phase

Production hardening is complete in source. Release approval is blocked only on applying migrations 001-012 and completing live Supabase, Storage, browser, and deployment checks in isolated environments.

## Current branch and last completed prompt

- Branch: `chore/production-hardening`
- Prompt: Production hardening, CI/CD, operations, and release verification.

## Completed work

- Role-scoped Supabase Auth, server guards, private Storage, Zod validation, and protected API routes for Admin, Teacher, Student, and Parent.
- Student/teacher/class/academic/attendance/timetable/exam/result/report-card/announcement/manual-fee workflows.
- Migrations 011 and 012 harden privileged writes, private photo ownership, fee-payment serialization, fee-history immutability, transactional student creation, enrollment capacity locking, and grade/exam lifecycle locking.
- Report-card generation validates UUIDs, is private/no-store, has a Node duration limit, batches attendance by academic year, and has a process-local request limit. Production deployments should also configure Vercel Firewall rate rules.
- Safe API errors and sanitized server logs. Application logs contain only an error name and operation, never bodies, cookies, identifiers, or database messages.
- CI runs `npm ci`, lint, typecheck, tests, and production build. Playwright role coverage is available through `npm run test:e2e` when fictional test credentials are supplied.

## Database migrations

Apply in timestamp order through:

- `20260802000100_create_school_schema.sql`
- `20260802000200_add_integrity_and_security_helpers.sql`
- `20260802000300_enable_row_level_security.sql`
- `20260802000400_create_private_storage_policies.sql`
- `20260802000500_support_admin_record_management.sql`
- `20260802000600_add_attendance_workflows.sql`
- `20260802000700_strengthen_academics_and_timetables.sql`
- `20260802000800_add_exam_gradebook_and_publication_workflows.sql`
- `20260803000900_secure_announcements_and_portals.sql`
- `20260803001000_complete_fee_management_and_reports.sql`
- `20260804001100_harden_privileged_workflows.sql`
- `20260804001200_strengthen_data_integrity.sql`

## Implemented routes

- Admin: `/admin`, `/admin/students`, `/admin/teachers`, `/admin/classes`, `/admin/academics`, `/admin/attendance`, `/admin/exams`, `/admin/announcements`, `/admin/fees`, `/admin/reports`.
- Teacher: `/teacher`, `/teacher/attendance`, `/teacher/academics`, `/teacher/grades`, `/teacher/announcements`.
- Student: `/student`, `/student/attendance`, `/student/timetable`, `/student/results`, `/student/announcements`, `/student/fees`.
- Parent: `/parent`, `/parent/attendance`, `/parent/timetable`, `/parent/results`, `/parent/announcements`, `/parent/fees`.

## Environment variables

- Public: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`.
- Server-only: `SUPABASE_SERVICE_ROLE_KEY`.
- Bootstrap only: `ADMIN_EMAIL`, `ADMIN_FIRST_NAME`, `ADMIN_LAST_NAME`.
- Optional and currently non-delivering announcement email: `RESEND_API_KEY`, `ANNOUNCEMENT_FROM_EMAIL`.
- E2E only: `E2E_BASE_URL` plus fictional `E2E_{ADMIN,TEACHER,STUDENT,PARENT}_{EMAIL,PASSWORD}` values.

## Known issues and release gate

- This Windows workspace cannot run Supabase migrations, pgTAP, real Auth, RLS isolation, private Storage, or browser E2E without a linked project.
- `npm audit` requires registry access. Resolve all accepted high/critical advisories before production deployment.
- Process-local API throttling is defense in depth, not distributed protection. Configure Vercel Firewall rate limits for report-card and invitation endpoints.
- Announcement email remains an intentional no-op pending approved recipient, opt-out, retry, and abuse policies.

## Validation status

On 2026-08-04: `npm run lint`, `npm run typecheck`, `npm run test` (28 tests), `npm run test:e2e -- --list`, and `npm run build` passed. Playwright browser execution, pgTAP execution, live RLS tests, and visual QA remain pending a disposable Supabase environment.

## Latest important commits

- `c405c1d` fix: harden privileged database workflows
- `d73ef61` fix: strengthen transactional data integrity
- `2219fe7` perf: batch report data and harden fee filters
- `0060a1a` fix: secure API responses and request handling
- `107cce9` test: add production hardening coverage
- `0932adc` ci: add production quality workflow

## Recommended next prompt

Provision a disposable Supabase project, apply migrations 001-012, execute the pgTAP/RLS role matrix and environment-gated Playwright suite, then perform preview and production smoke tests before release approval.
