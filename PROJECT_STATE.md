# Project State

## Current phase

Authentication and database foundation complete. The project is ready for MVP school-record modules.

## Current branch

`feat/auth-database-foundation`

## Last completed prompt

Build the secure database and authentication foundation.

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

## In-progress work

Migration execution and RLS test execution require a supported Supabase CLI host or a linked Supabase project. The npm-distributed CLI has no Windows binary for this runtime.

## Remaining work

- Build MVP student, teacher, class, section, attendance, and admin dashboard modules.
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

## Database migrations

- `20260802000100_create_school_schema.sql`
- `20260802000200_add_integrity_and_security_helpers.sql`
- `20260802000300_enable_row_level_security.sql`
- `20260802000400_create_private_storage_policies.sql`

## Implemented routes

- `/` redirects to `/login`
- `/login`
- `/unauthorized`
- `/admin`
- `/teacher`
- `/student`
- `/parent`
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
- Feature-level student, teacher, attendance, and dashboard functionality is not implemented yet.
- `npm audit` reports three high-severity dependency findings. Review them before production deployment; do not apply a forced upgrade without compatibility verification.

## Test and build status

2026-08-02: `npm run lint`, `npm run typecheck`, and `npm run build` passed. The pgTAP database test file was added but could not run without a Supabase database environment.

## Latest important commits

- `11a0acd` chore: initialize application foundation
- `5e0e2d5` feat: add shared application shell
- `d98d1a1` feat: add normalized school database schema
- `440bf35` feat: add row level security policies
- `7202191` feat: integrate role based authentication

## Recommended next prompt

Apply and verify the Supabase migrations in a real project, then implement MVP student, teacher, class, section, attendance, and admin-dashboard records.
