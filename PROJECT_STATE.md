# Project State

## Current phase

Foundation complete. The project is ready for the authentication, database, and RLS implementation phase.

## Current branch

`chore/project-foundation`

## Last completed prompt

Implement the repository and application foundation.

## Completed work

- Configured strict TypeScript, path aliases, Tailwind CSS 4, shadcn/ui configuration, and semantic light-mode tokens.
- Added Supabase SSR browser, server, and session-refresh proxy helpers with validated environment access.
- Added TanStack Query, Sonner notifications, central query keys, safe error logging, and shared UI foundations.
- Added responsive application shell, role-aware navigation, mobile navigation, authentication routes, protected route group, and safe role dashboard placeholders.
- Added root loading, error, and not-found handling.
- Added README, beginner guide, environment example, and this project state file.

## In-progress work

None.

## Remaining work

- Create Supabase migrations, normalized schema, RLS policies, first-admin bootstrap, and invitation workflow.
- Build MVP student, teacher, class, section, attendance, and admin dashboard modules.
- Build beta academic, timetable, gradebook, report-card, announcement, portal, and fee modules.
- Add database, integration, end-to-end, accessibility, and deployment test coverage.

## Important architecture decisions

- Next.js 16 uses `proxy.ts` and asynchronous request APIs.
- Supabase Auth owns credentials. The service-role key is server-only and reserved for future privileged provisioning.
- Server Components remain the default for initial reads. Client components are limited to interactive UI and use TanStack Query when client server-state is needed.
- The two future school brand colors are centralized as `--brand` and `--accent`; components use semantic tokens only.
- Placeholder role pages intentionally contain no academic or personal data until profile roles and RLS exist.

## Database migrations

None yet.

## Implemented routes

- `/` redirects to `/login`
- `/login`
- `/unauthorized`
- `/admin`
- `/teacher`
- `/student`
- `/parent`

## Environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` server-only

## Known issues

- Supabase project configuration, migrations, RLS, role profiles, and invitation provisioning are not implemented.
- Role placeholder routes are authentication-aware but cannot enforce final role authorization until the profile schema and RLS policies exist.
- Automated test suites are not installed yet.
- `npm audit` reports three high-severity dependency findings. Review them before production deployment; do not apply a forced upgrade without compatibility verification.

## Test and build status

2026-08-01: `npm run lint`, `npm run typecheck`, and `npm run build` passed. No test script exists yet.

## Latest important commits

- `11a0acd` chore: initialize application foundation
- `5e0e2d5` feat: add shared application shell

## Recommended next prompt

Implement Supabase schema foundations, role profiles, RLS helper functions and policies, first-admin bootstrap, invite-only provisioning, and final role authorization.
