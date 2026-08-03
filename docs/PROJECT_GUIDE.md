# Jahan School Management System Guide

## Overview

Jahan is a single-school system for administrators, teachers, students, and parents. It covers records, attendance, academics, timetables, exams/results/report cards, announcements, and manual fee records. Online payments and out-of-scope enterprise modules are not included.

## Roles and daily use

- **Admin:** manages school records, academic setup, attendance review, exams, announcements, fees, reports, and account invitations.
- **Teacher:** sees only assigned academic work, marks attendance, enters grades for assigned subject papers, and targets announcements only to assigned sections.
- **Student:** reads only personal attendance, timetable, published results/report cards, announcements, and fees.
- **Parent:** reads only linked-child attendance, timetable, published results/report cards, announcements, and fees.

## Setup and initial administrator

1. Create separate Supabase projects for development/preview and production. Never use seed data in production.
2. Copy `.env.example` to `.env.local` and set the required variables below.
3. Apply every migration in `supabase/migrations/` in timestamp order, ending with `20260804001200_strengthen_data_integrity.sql`.
4. Set `ADMIN_EMAIL`, `ADMIN_FIRST_NAME`, and `ADMIN_LAST_NAME` temporarily, then run `npm run bootstrap:admin` once. Remove the bootstrap variables afterwards.
5. Complete the invitation through Supabase Auth and sign in.

| Variable | Where it belongs | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | local, Vercel preview, Vercel production | Project URL; safe for the browser. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | local, Vercel preview, Vercel production | Publishable Supabase key; safe for the browser. |
| `NEXT_PUBLIC_SITE_URL` | local, Vercel preview, Vercel production | Exact application origin used in invitation redirects. |
| `SUPABASE_SERVICE_ROLE_KEY` | local and server deployment only | Invitation/bootstrap administration. Never expose it to the browser. |
| `RESEND_API_KEY`, `ANNOUNCEMENT_FROM_EMAIL` | server deployment only | Reserved for a future approved announcement-email policy. |

## Deployment

Vercel detects this Next.js project through `vercel.json`. GitHub Actions validates every pull request and push to `main` with `npm ci`, lint, typecheck, tests, and a production build. It does not receive secrets.

1. Connect the repository to Vercel. Map preview deployments to the non-production Supabase project and production deployments to a separate production project.
2. Add the environment variables above separately for Preview and Production. Do not promote a build with preview `NEXT_PUBLIC_` values to production because public Next.js values are embedded during build.
3. In Supabase Auth, add the exact Vercel preview and production callback URLs: `https://your-domain/auth/callback`. Set the production Site URL to the final domain.
4. Add the custom domain in Vercel, verify DNS, then add the same HTTPS domain to Supabase Auth redirect URLs before enabling invitations.
5. Keep `profile-photos`, `school-documents`, and `report-cards` private. The profile-photo bucket allows JPEG, PNG, and WebP up to 5 MB; report cards are generated on demand and are never publicly cached.
6. Configure Vercel Firewall rate rules for `/api/results/*/report-card` and `/api/admin/accounts`. The application also applies process-local protection, but platform rules are the production control.

### Migration promotion

Apply migrations to development first, then preview/staging, then production. Take a backup before every production migration. Use the Supabase CLI or dashboard migration workflow from a supported machine, verify migration history, and never edit an applied migration. Production corrections must be new forward-only migrations.

### Smoke test after each deployment

Use fictional accounts and data:

1. Sign in as each role and confirm its dashboard route.
2. Confirm a teacher cannot access admin routes or an unassigned attendance roster/gradebook.
3. Confirm student self-only and parent linked-child-only attendance, fees, results, and report-card access.
4. Record a manual fee payment, attempt an overpayment, and confirm the balance/status.
5. Publish a complete exam, verify grades become immutable, and download an authorized report card.
6. Verify an unauthorized report-card URL fails, a private photo is not public, and a valid owner/admin upload works.
7. Check Vercel logs for sanitized errors only, GitHub Actions status, and browser use at 320px, 768px, and 1280px.

### Rollback

For an application-only failure, redeploy the last healthy Vercel deployment. Database migrations are forward-only: do not restore a database merely to revert code. Create a corrective migration unless data loss or a confirmed severe incident requires restoring the latest verified backup under the school owner’s approval. After a restore, rotate affected keys, re-run migrations only as documented, and repeat the smoke test.

## Backup and maintenance

- **Backups:** enable the Supabase plan’s regular backups/PITR where available. Before migrations or bulk imports, create and label a manual backup. Periodically export critical student, attendance, grades, and fee records through an approved administrator workflow or secure database export.
- **Restore:** test restoration in a non-production project first. Record the backup timestamp, restore owner, migrations present, validation result, and any corrective actions.
- **Key rotation:** rotate Supabase keys if exposed or on the school’s schedule. Update local/Vercel server settings, redeploy, verify sign-in/invitations, then revoke the old key. Never log or commit keys.
- **Dependencies:** run `npm audit --omit=dev` from a connected environment, review high/critical findings, update with tests and build checks, and commit the lockfile with the update.
- **Logs and monitoring:** Vercel captures concise application errors. Logs intentionally exclude request data, cookies, record IDs, database messages, and secrets. Review failed requests and Auth/Storage audit information after releases.
- **Migrations:** retain all migration files permanently and apply only in order. Run pgTAP against the linked Supabase database after migration promotion.

## Testing

```text
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

`npm run test` includes unit and workflow-contract coverage. `supabase/tests/production_hardening.test.sql` is a pgTAP structural gate for a linked database. `npm run test:e2e` runs Playwright role access checks only when `E2E_BASE_URL` and fictional role credentials are set. It covers admin authentication, teacher/admin separation, and student/parent read-only route isolation; live data scenarios must additionally verify attendance, grade publication, fees, announcements, and report-card authorization during the smoke test.

## Troubleshooting

- **Login redirects to unauthorized:** confirm the Auth user has an active `profiles` row with the intended fixed role.
- **Invitation fails:** confirm the service-role key is server-only, the Site URL is correct, and Supabase permits the callback URL.
- **Storage upload fails:** check private bucket policies, object path ownership, MIME type, and size.
- **Migration fails:** stop promotion, restore or correct only in the non-production environment, and add a new migration. Do not edit an applied migration.
- **Report card fails:** confirm publication, student/parent scope, completed grades, and platform rate-limit logs.

## Current limitations

Live Supabase migration, RLS, Storage, pgTAP, browser E2E, accessibility scanning, and visual QA have not run from this repository because no linked disposable project is available. Announcement email is intentionally disabled until an approved policy exists.
