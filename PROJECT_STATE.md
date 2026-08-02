# Project State

## Current phase

MVP admin record management is implemented on the feature branch. A linked Supabase project is still required to apply the migration and verify runtime RLS and Storage behavior.

## Current branch

`feat/mvp-admin-records`

## Last completed prompt

Build the administrative record-management portion of the MVP.

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
- Added centralized admin DTOs, Zod schemas, data-access functions, protected API routes, TanStack Query table mutations, and focused unit/contract tests.
- Added a migration that gives teacher records independent identity/contact fields, adds enforced section capacity, and performs section transfers atomically.

## In-progress work

- Apply migration `20260802000500_support_admin_record_management.sql` in the configured Supabase project.
- Exercise admin records, RLS policies, Storage policies, and invitation email flows against the linked project.

## Remaining work

- Apply and verify the existing migrations in a Supabase project before relying on database-backed UI.
- Build teacher-scoped daily attendance marking and admin attendance summaries.
- Build beta academic, timetable, gradebook, report-card, announcement, portal, and fee modules.
- Add database, integration, end-to-end, accessibility, and deployment test coverage.

## Important architecture decisions

- Next.js 16 uses `proxy.ts` and asynchronous request APIs.
- Supabase Auth owns credentials. The service-role key is server-only and reserved for future privileged provisioning.
- Server Components remain the default for initial reads. Client components are limited to interactive UI and use TanStack Query when client server-state is needed.
- The two future school brand colors are centralized as `--brand` and `--accent`; components use semantic tokens only.
- Placeholder role pages intentionally contain no academic or personal data until profile roles and RLS exist.
- `profiles.id` references `auth.users.id`; passwords and password hashes are never stored in application tables.
- RLS authorization uses private security-definer helper functions, role/profile links, teacher assignments, and parent-child links. The service-role key is limited to invitation and bootstrap code.
- Storage buckets are private. Persisted report cards are admin-only; future student and parent report downloads are generated through protected server routes.
- The admin data-access layer is server-only, requires an active admin profile, and returns minimal DTOs. Interactive admin tables use protected API routes with the same server-side role check and database RLS.
- Student account invitations are optional. The school record is created or edited independently; an email invitation only links an Auth profile when requested.
- A section does not have a homeroom-teacher field because the approved normalized schema models teacher assignments by subject and academic year. Capacity is enforced per active academic-year enrollment.

## Database migrations

- `20260802000100_create_school_schema.sql`
- `20260802000200_add_integrity_and_security_helpers.sql`
- `20260802000300_enable_row_level_security.sql`
- `20260802000400_create_private_storage_policies.sql`
- `20260802000500_support_admin_record_management.sql`

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
- `/admin/attendance` (truthful placeholder until daily marking is delivered)
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

- Migrations and RLS policies could not be applied locally because this runtime has no Docker/Postgres installation and the npm Supabase CLI package has no Windows binary.
- Database policy execution, Auth invitation confirmation, and logout require a configured Supabase project for runtime verification.
- The current database test file checks schema and policy presence; role-isolation execution tests are pending a local or linked Supabase environment.
- Daily teacher attendance marking and its full admin summary screen are not implemented. The dashboard only counts existing records for today.
- Profile-photo upload UI is deferred even though the private Storage bucket and policies are ready; it should be added only after runtime Storage policy verification.
- Migration, RLS, invitation, account-link, and capacity behavior cannot be executed in this Windows runtime without a linked Supabase project.
- `npm audit` reports three high-severity dependency findings. Review them before production deployment; do not apply a forced upgrade without compatibility verification.

## Test and build status

2026-08-02: `npm run lint`, `npm run test` (7 tests), `npm run typecheck`, and `npm run build` passed. The initial-admin command safely rejects missing required environment values. Database pgTAP and live RLS tests remain pending a Supabase database environment.

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

## Recommended next prompt

Apply migrations through `20260802000500` to a Supabase project, then perform live admin CRUD, enrollment-transfer, capacity, RLS, invitation, and private Storage verification. After that, implement teacher-scoped daily attendance marking and admin attendance summaries.
