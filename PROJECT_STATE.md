# Project State

## Current phase

MVP stabilization, academic/timetable, and examination/report-card source implementation are complete locally. `release/mvp` remains merged. Production approval remains blocked until a linked Supabase project verifies migrations, live Auth, RLS isolation, report-card access, and Storage policies.

## Current branch

`feat/exams-report-cards`

## Last completed prompt

Implement examinations, grade entry, result calculation, and report-card generation.

## Completed work

- Configured strict TypeScript, path aliases, Tailwind CSS 4, shadcn/ui configuration, and semantic light-mode tokens.
- Added Supabase SSR browser, server, and session-refresh proxy helpers with validated environment access.
- Added TanStack Query, Sonner notifications, central query keys, safe error logging, and shared UI foundations.
- Added responsive application shell, role-aware navigation, mobile navigation, authentication routes, protected route group, and safe role dashboard placeholders.
- Added root loading, error, and not-found handling.
- Added README, beginner guide, environment example, and this project state file.
- Added four versioned Supabase migrations for normalized school data, integrity triggers, RLS policies, and private Storage buckets.
- Added credential-free local seed identities and a pgTAP database-foundation test file.
- Added profile-based role resolution, authenticated route guards, dashboard redirects, Auth callback handling, logout, and server-only invitation provisioning.
- Added a one-time server-only first-admin bootstrap command.
- Added secure, paginated admin management for students, teachers, classes, and sections, with responsive tables, detail sheets, confirmation dialogs, and clear empty/error states.
- Added guardian details, active/inactive student status changes, optional secure account invitations, and account-status labels that distinguish school records from activated logins.
- Added admin dashboard operational counts and a truthful current-day attendance progress count when a current academic year exists.
- Added validated private Storage profile-image upload for linked student accounts; the path is checked against the linked profile before it is saved.
- Added centralized admin DTOs, Zod schemas, data-access functions, protected API routes, TanStack Query table mutations, and focused unit/contract tests.
- Added a migration that gives teacher records independent identity/contact fields, adds enforced section capacity, and performs section transfers atomically.
- Added teacher-scoped attendance marking, admin attendance review/correction, student self-only attendance, and parent linked-child attendance.
- Added role-specific teacher, student, and parent dashboards, plus admin pending-attendance counts.
- Added academic-year date validation and an atomic attendance save function that validates assignment, roster membership, and duplicates.
- Audited protected routes, server guards, RLS policy presence, seed-data safety, validation contracts, filtering, duplicate protection, and destructive-record safeguards.
- Repaired the demonstration seed so its teacher satisfies the required record fields and added fictional attendance examples without usable credentials or personal data.
- Added release contract checks for seed safety, role-route/API guards, RLS policy presence, and server-only service-role usage.
- Added administrator management for academic years, non-overlapping terms, active subjects, teaching assignments, and weekly timetables.
- Added migration-backed term containment/overlap rules, active-only subject-code uniqueness, timetable assignment consistency, room overlap protection, and useful section/teacher/room conflict messages.
- Added teacher workload and timetable views plus student self and parent linked-child timetable views. All read-only scope remains derived from existing assignments and current enrollments.
- Added enrollment history review without a destructive reassignment path, Zod contracts for academic forms, protected academic APIs, and academic migration/RLS contract coverage.
- Added exam and subject-paper setup with term-bound exam dates, maximum/passing-mark validation, draft/open/closed/published lifecycle, and admin-only publication.
- Added assignment-scoped teacher gradebooks, atomic grade saves, marks validation, audit history, published-result locks, and full-roster publication checks.
- Added one shared deterministic result-calculation module for screen and PDF data, including absence, exemption, missing marks, totals, averages, grades, and pass/fail status.
- Added student self-only and parent linked-child published-result views plus protected on-demand PDF report cards generated with `@react-pdf/renderer`.

## In-progress work

- Complete the linked-Supabase release checklist in `docs/MVP_AUDIT.md` before declaring the merged MVP release-ready.
- Apply the academic and examination migrations in a linked Supabase project and execute live role-isolation, publication, grade-lock, and report-card access checks.

## Remaining work

- Approve the MVP only after real-project migration, Auth, role-isolation, direct-route, attendance, and private-Storage checks pass.
- Build the announcement and fee modules.
- Add database, integration, end-to-end, accessibility, and deployment test coverage.

## Important architecture decisions

- Next.js 16 uses `proxy.ts` and asynchronous request APIs.
- Supabase Auth owns credentials. The service-role key is server-only and reserved for future privileged provisioning.
- Server Components remain the default for initial reads. Client components are limited to interactive UI and use TanStack Query when client server-state is needed.
- The two future school brand colors are centralized as `--brand` and `--accent`; components use semantic tokens only.
- Dashboard placeholders are explicitly labelled whenever timetable, fees, or announcements have no implemented data source.
- `profiles.id` references `auth.users.id`; passwords and password hashes are never stored in application tables.
- RLS authorization uses private security-definer helper functions, role/profile links, teacher assignments, and parent-child links. The service-role key is limited to invitation and bootstrap code.
- Storage buckets are private. Persisted report cards are admin-only; future student and parent report downloads are generated through protected server routes.
- The admin data-access layer is server-only, requires an active admin profile, and returns minimal DTOs. Interactive admin tables use protected API routes with the same server-side role check and database RLS.
- Student account invitations are optional. The school record is created or edited independently; an email invitation only links an Auth profile when requested.
- A section does not have a homeroom-teacher field because the approved normalized schema models teacher assignments by subject and academic year. Capacity is enforced per active academic-year enrollment.
- Attendance saves use a security-invoker database function. Teachers need a current section assignment; repeated saves correct an existing record rather than duplicating it.
- Academic years and terms are retained as historical records. A term must stay inside its year and cannot overlap another term. An academic year cannot be shortened to exclude existing term or enrollment dates.
- Teacher assignments are year-scoped and are the authority for teacher timetable access. Timetable entries inherit teacher, section, and subject context from an assignment and reject section, teacher, and named-room collisions.
- Exam subject papers belong to an exam, section, and subject, with their date constrained to the selected term. Teachers can save grades only through matching year/section/subject assignments; administrators alone can publish a complete exam.
- Published results are immutable at the database layer. Public result reads require publication and existing student or parent scope; report cards are generated on demand through the same protected result lookup and never persisted.
- Result calculations live in `lib/results/calculations.ts` and are passed as a DTO to both screen and PDF rendering, preventing formula drift.

## Database migrations

- `20260802000100_create_school_schema.sql`
- `20260802000200_add_integrity_and_security_helpers.sql`
- `20260802000300_enable_row_level_security.sql`
- `20260802000400_create_private_storage_policies.sql`
- `20260802000500_support_admin_record_management.sql`
- `20260802000600_add_attendance_workflows.sql`
- `20260802000700_strengthen_academics_and_timetables.sql`
- `20260802000800_add_exam_gradebook_and_publication_workflows.sql`

## Implemented routes

- `/` redirects to `/login`
- `/login`
- `/unauthorized`
- `/admin`
- `/teacher`
- `/student`
- `/parent`
- `/admin/students`
- `/admin/teachers`
- `/admin/classes`
- `/admin/attendance`
- `/admin/academics`
- `/admin/exams`
- `/teacher/attendance`
- `/teacher/academics`
- `/teacher/grades`
- `/teacher/grades/[id]`
- `/student/attendance`
- `/student/timetable`
- `/student/results`
- `/parent/attendance`
- `/parent/timetable`
- `/parent/results`
- `/dashboard`
- `/auth/callback`
- `/auth/signout`

## Environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` server-only
- `ADMIN_EMAIL`, `ADMIN_FIRST_NAME`, and `ADMIN_LAST_NAME` only while running the initial-admin bootstrap command

## Known issues

- Migrations and RLS policies through `20260802000800` could not be applied locally because this runtime has no Docker/Postgres installation and the npm Supabase CLI package has no Windows binary.
- Database policy execution, Auth invitation confirmation, and logout require a configured Supabase project for runtime verification.
- The current database test file checks schema and policy presence; role-isolation execution tests are pending a local or linked Supabase environment.
- Profile-image upload requires a linked student account and still needs live private-Storage policy verification.
- Migration, RLS, invitation, account-link, capacity, attendance, direct-route, and Storage behavior cannot be executed in this Windows runtime without a linked Supabase project. This prevents a release or tag claim.
- `npm audit` reports three high-severity dependency findings. Review them before production deployment; do not apply a forced upgrade without compatibility verification.
- The sample report-card PDF parsed as a one-page document with expected text. PNG rendering could not be completed because the bundled Poppler launcher cannot find its native executable in this managed Windows environment.

## Test and build status

2026-08-03: `npm run lint`, `npm run test` (18 tests), and `npm run typecheck` passed. Static tests cover route/API guards, RLS-policy presence, server-only service-role usage, safe seed data, filters, attendance/enrollment, academic/timetable validation, mark limits, calculations, publication locks, and result/report-card scope. `npm run build` was attempted but could not fetch the pre-existing Google Geist fonts because this managed environment has restricted network access. Database pgTAP and live RLS/Auth tests remain pending a Supabase database environment.

## Latest important commits

- `11a0acd` chore: initialize application foundation
- `5e0e2d5` feat: add shared application shell
- `d98d1a1` feat: add normalized school database schema
- `440bf35` feat: add row level security policies
- `7202191` feat: integrate role based authentication
- `a5ace2a` fix: make initial admin bootstrap executable
- `05bd9d8` docs: document database and admin setup
- `d6378cc` docs: record authentication foundation verification
- `e1e4ade` Merge pull request #2 from ShoaibShuja/feat/auth-database-foundation
- `224b365` feat: add secure admin record data layer
- `fa0571b` feat: add admin record management screens
- `038504e` test: cover admin record contracts
- `b828b23` fix: enforce filtered enrollment records
- `8fbe45d` feat: add secure attendance data workflows
- `71c1063` feat: add role attendance and dashboard screens
- `8007c43` docs: document attendance dashboards
- `bd0d6cf` fix: stabilize safe MVP demonstration data
- `7274b85` docs: record MVP stabilization audit
- `c04a5b9` docs: record release seed stabilization
- `e3a1047` Merge pull request #5 from ShoaibShuja/release/mvp
- `4f2b535` docs: refresh continuation state
- `5eb5145` feat: add academic structure and timetable workflows
- `77d4ed8` feat: add exams gradebooks and report cards

## Recommended next prompt

Apply migrations through `20260802000800` to a Supabase project and complete the live checklist in `docs/MVP_AUDIT.md`, including teacher grade scope, publication, grade-lock, student/parent isolation, and report-card download checks. If every check passes, tag the merged MVP as `v0.1.0-mvp`; then implement announcements or fee record-keeping without weakening the existing RLS boundaries.
