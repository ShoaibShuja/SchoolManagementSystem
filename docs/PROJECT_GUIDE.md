# Jahan School Management System Guide

## What the system does

Jahan is a single-school web system for managing students, teachers, academic setup, attendance, results, timetables, announcements, and manual fee records. It is intentionally limited to one school and does not process online payments.

## User roles

- **Admin:** manages records, academic setup, fees, announcements, reports, account invitations, and the dashboard.
- **Teacher:** works only with assigned classes and subjects, attendance, grades, timetables, and assigned-section announcements.
- **Student:** reads personal attendance, timetable, published results/report cards, announcements, and fees.
- **Parent:** reads the same information for linked children only.

Roles are fixed. Do not attempt to create custom roles in the database or interface.

## Main features

- Student and teacher records with admissions/employment details and account linking.
- Classes, sections, academic years, terms, subjects, teacher assignments, and enrollments.
- Daily attendance, weekly timetables, exams, gradebooks, results, and PDF report cards.
- Targeted announcements, student and parent portals, manual fees/payments, and an operational admin dashboard.

## Important folders

| Folder or file | Purpose |
| --- | --- |
| `app/` | Pages and protected API routes. |
| `components/` | Reusable interface and domain components. |
| `lib/` | Authentication, validation, data access, and business rules. |
| `supabase/migrations/` | Forward-only database schema and security changes. |
| `supabase/tests/` | Database structural tests for a linked Supabase project. |
| `tests/` | Automated source and workflow tests. |
| `scripts/bootstrap-admin.ts` | One-time first-admin invitation script. |
| `docs/` | Owner guide and release handover checklist. |

## Install locally

1. Install Node.js 20.9 or later and Git.
2. Clone the repository and enter its folder.
3. Copy `.env.example` to `.env.local`.
4. Add the environment values below. Never commit `.env.local`.
5. Run `npm ci`.
6. Apply every migration to a development Supabase project before starting the app.
7. Run `npm run bootstrap:admin` once to create the first administrator invitation.
8. Run `npm run dev`, then open `http://localhost:3000`.

## Environment variables

| Variable | Required in | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | local, Preview, Production | Supabase project URL. Safe for the browser. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | local, Preview, Production | Supabase publishable key. Safe for the browser. |
| `NEXT_PUBLIC_SITE_URL` | local, Preview, Production | Exact site origin used for Auth redirects. |
| `SUPABASE_SERVICE_ROLE_KEY` | local and server deployment only | Creates/administers invitations. Never expose it in browser code. |
| `ADMIN_EMAIL`, `ADMIN_FIRST_NAME`, `ADMIN_LAST_NAME` | bootstrap only | Used once by the initial-admin script; remove afterwards. |
| `RESEND_API_KEY`, `ANNOUNCEMENT_FROM_EMAIL` | not active | Reserved for a future approved email policy. |
| `E2E_BASE_URL`, `E2E_*_EMAIL`, `E2E_*_PASSWORD` | test only | Fictional-account browser tests. Never point them at production. |

## Connect Supabase and create the first admin

1. Create separate Supabase projects for development/preview and production. Do not use demonstration data in production.
2. In each project, apply all migration files in `supabase/migrations/` in timestamp order, ending with `20260806001300_fix_grade_entry_validation.sql`.
3. Create the private Storage buckets named by the migrations, and confirm their policies applied. Keep `profile-photos`, `school-documents`, and `report-cards` private.
4. For a disposable development or Preview project only, optionally paste `supabase/seed.sql` into the Supabase SQL Editor. It creates fictional Afghan school data and test accounts for all portals. Do not run it in Production or alongside real school data.
5. Put the project URL, publishable key, and service-role key in the correct local or Vercel environment. Keep the service-role key server-only.
6. If you did not use the demo seed, temporarily set the three `ADMIN_*` values, run `npm run bootstrap:admin`, then remove those three values.
7. Accept the Supabase invitation, set the password in Supabase Auth, and sign in.

If the script says an administrator already exists, use that account; do not run the bootstrap again.

## Load fictional demo data

The optional `supabase/seed.sql` file is for demonstrations, development, preview testing, and role-permission checks. It is not an import template for a real school.

- Apply migrations 001-013 first, then paste the entire seed file into the Supabase SQL Editor and run it once. The seed includes the same grade-validation repair as migration 013 for a project that was previously migrated only through 012.
- The seed creates 48 fictional students in Grade 7-9 sections A and B, eight teachers, 48 guardians, attendance history, a weekly timetable, results, fees and payments, plus published, targeted, and draft announcements.
- It creates representative fixed-role accounts. The file header lists the login emails and shared non-production password. Change or remove these accounts before exposing the project to anyone outside the test team.
- The seed resolves academic years, terms, classes, sections, subjects, exams, and fee types by their names or other business keys. It can therefore coexist with the earlier lightweight seed instead of assuming the same UUIDs. Published grades and payment history are only inserted when missing, so their historical rows are not changed.
- The seed creates and removes an RLS-protected internal reference helper while it runs. It leaves no helper table behind after a successful run and does not depend on a session-local temporary table.
- Use the confirmation query at the end of the script to verify expected record counts. Delete or reset the disposable project rather than attempting to turn demonstration data into Production data.

## Deploy

1. Make the repository owner-controlled in GitHub and ensure GitHub Actions is green.
2. Connect the repository to Vercel. The included `vercel.json` uses `npm ci` and `npm run build`.
3. Connect Preview to the non-production Supabase project and Production to the production Supabase project. Create a fresh production build after changing any `NEXT_PUBLIC_*` value.
4. Add the environment variables separately to Preview and Production.
5. In Supabase Auth, add `https://your-domain/auth/callback` and the corresponding Preview callback URLs. Set the Production Site URL to the final HTTPS domain.
6. Add the custom domain in Vercel, verify DNS, then confirm the same domain in Supabase Auth.
7. Enable backups/PITR if offered by the Supabase plan. Configure Vercel Firewall rate limits for `/api/results/*/report-card` and `/api/admin/accounts`.
8. Complete the smoke test in the handover checklist before announcing the release.

The application allows `'unsafe-eval'` only while running in development because React needs it for useful debug errors. Production builds do not receive that CSP exception.

## Admin manual

1. Start with **Academics**: create the active academic year, terms, classes, sections, subjects, and teacher assignments.
2. Add teachers and students. Give each student an admission number and active enrollment. Add guardian details during student creation.
3. Link a login account only when the person needs portal access. Send invitations through the supported admin workflow.
4. Review daily attendance and resolve data errors promptly. Teachers mark attendance for their assignments.
5. Create exams, configure subject papers, review grades, and publish only when complete. Published grades are locked to preserve the result history.
6. Create fee types and fee records, then record cash/bank/manual payments. Do not enter a payment above the outstanding balance.
7. Publish announcements to appropriate roles, classes, or sections. Review the dashboard and reports for daily operations.

## Teacher manual

1. Sign in and use **Attendance** only for assigned sections and dates.
2. Use **Grades** only for assigned subject papers. Check maximum marks before saving.
3. A published exam cannot be altered. Ask an administrator to follow the documented correction process instead of editing result history.
4. Review the timetable and use **Announcements** only for assigned sections. Teachers cannot manage fees or other administrators' records.

## Student manual

Students can view personal attendance, timetable, published results, download their own report card, announcements, and fee status. They cannot change academic, attendance, grade, or fee records. Missing or incorrect information should be reported to the school office.

## Parent manual

Parents can select a linked child and view that child’s attendance, timetable, published results/report cards, announcements, and fee records. They cannot edit records or view any unlinked child. Ask the school office to correct a guardian link.

## Change brand colors

The two main colors are centralized in `app/globals.css`:

- Set `--brand` for the primary school color.
- Set `--accent` for the secondary school color.

Also check `--brand-foreground` and `--accent-foreground` for readable text contrast. Use an accessible color-contrast checker, test buttons, focus outlines, and small mobile text, then run lint, typecheck, tests, and a build.

## Dashboard appearance

The signed-in dashboards use a centralized visual system in `app/globals.css`. Alongside the main `--brand` and `--accent` values, the `--dashboard-*` tokens control the deep navigation color and the soft blue, mint, lilac, and warm metric-card accents. Change these tokens together only after checking text contrast and all four role dashboards on phone and desktop widths.

Dashboard information and permissions do not change when its appearance is updated: Admin, Teacher, Student, and Parent data is still controlled by server authorization and Supabase Row Level Security.

## Light and dark mode

Use the sun/moon control in the top-right application header to switch between light and dark mode. The control is also available on the sign-in and access-restricted screens. On a first visit, the application follows the device's current color preference. Once someone chooses a mode, the browser remembers it under the key `jahan-color-theme` and restores it before the page is shown. This preference is private to that browser and device; it is not stored in the school database or shared with other accounts.

The dark palette is defined beside the light palette in `app/globals.css` under `html[data-theme="dark"]`. Update semantic tokens, not individual component colors, and check contrast for text, form fields, focus rings, status labels, and both dashboard card palettes in each mode.

## Change the school name and school information

The current school name is intentionally simple and code-based, not a database setting. Update these places together:

- `app/layout.tsx` for browser title metadata.
- `components/shell/app-shell.tsx` for the signed-in header.
- `app/(auth)/login/page.tsx` and `app/error.tsx` for public screens.
- `components/results/report-card-document.tsx` for PDF report cards.

Search the project for `Jahan School` afterwards to catch all remaining copy. Make one small commit, test the PDF report card, and deploy a new build.

## Manage academic years and users

Create one active academic year with valid start/end dates, then its terms, classes, sections, subjects, assignments, and enrollments. Keep historical academic years rather than editing past records. Before a new school year, review capacity, teacher assignments, timetable conflicts, and fee setup.

Create staff/student records first. Link a Supabase Auth account only when portal access is needed and choose the appropriate fixed role. A parent account must be linked to the correct child by an administrator. Deactivate records instead of deleting historical academic or financial evidence.

## Generate report cards

1. Confirm that every required grade is entered and the exam is ready.
2. Publish the exam from the admin workflow. Publication locks its grade history.
3. The authorized student or linked parent can open the published result and download a private PDF report card. Administrators can use reporting screens for operational review.
4. If a result is wrong, preserve the audit trail. Use the approved correction process and a new forward-only database change if a system-level issue exists.

## Manage fees

Fee records are manual bookkeeping, not online payments. An administrator creates a fee type and student fee record with an amount and due date, then records each payment. The system calculates unpaid, partially paid, paid, or overdue status. Payment history is append-only and the system rejects overpayments. Students and parents can only view authorized fee records.

## Back up data and apply migrations

- Enable Supabase backups/PITR. Before a migration, bulk import, or major correction, create and label a manual backup.
- Periodically export essential student, attendance, result, and fee data through an approved secure process.
- Test a restore into a non-production project quarterly. Record the backup date, restore owner, migration level, and outcome.
- Apply migrations to development, then Preview, then Production. Take a Production backup first. Verify migration history after each promotion.
- Never edit an applied migration or restore a database solely to undo application code. Use a new forward-only corrective migration unless a severe approved incident requires a restore.

## Update dependencies

Each month, run `npm ci`, `npm audit --omit=dev`, `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` in a branch. Review high or critical findings promptly, update deliberately, test Preview, then commit both `package.json` and `package-lock.json`. Do not run force upgrades without reviewing compatibility and release tests.

## Troubleshooting

- **Login redirects to unauthorized:** verify an active `profiles` row has the intended fixed role.
- **Login says authentication is not configured:** add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the matching Vercel environment, then redeploy. Public `NEXT_PUBLIC_*` values are compiled into the browser build.
- **Invitation fails:** check server-only service-role key, exact `NEXT_PUBLIC_SITE_URL`, and Supabase Auth callback URLs.
- **Storage upload fails:** verify private bucket policy, object ownership path, allowed JPEG/PNG/WebP type, and 5 MB photo limit.
- **Migration fails:** stop promotion. Investigate in non-production and add a new corrective migration; never edit a migration already applied elsewhere. Storage buckets and their policies are created in migration `004`; run it before later workflow migrations.
- **Report card fails:** verify a published, complete result and student/parent scope. Check Vercel Firewall and sanitized logs.
- **A parent sees no child:** verify the administrator created the correct guardian-child link and the child remains active.

## Known limitations

- Online payments, email delivery, and all excluded enterprise modules are intentionally absent.
- Announcement email remains disabled until a school-approved recipient, opt-out, retry, and abuse policy exists.
- The final live Supabase migration, RLS/Storage, browser E2E, accessibility, mobile visual, and deployment checks must be completed before production approval. See `PROJECT_STATE.md` and `HANDOVER_CHECKLIST.md`.
- Application request throttling is process-local defense in depth; Vercel Firewall remains the production rate-limit control.

## Simple maintenance checklist

- Daily: review failed invitations, attendance exceptions, overdue fees, and Vercel/Supabase alerts.
- Monthly: run the dependency checks, review admin users and access, and confirm backups are succeeding.
- Before every release: run tests/build, deploy Preview, test every role with fictional accounts, and confirm database migration/rollback plans.
- Quarterly: test a non-production backup restore, review domain and provider ownership, rotate credentials on schedule, and review this guide.

## Development phases and important changes

1. Core school modules delivered fixed roles, records, academics, attendance, results, timetables, announcements, portals, fees, and dashboard.
2. UI and accessibility polish added responsive navigation, touch-friendly forms, readable tables, semantic tokens, focus visibility, and reduced-motion support.
3. Production hardening added RLS/server guards, private Storage, authoritative fee/announcement workflows, transaction and lifecycle locks, safe API errors, secure PDF responses, CI, Vercel configuration, and release tests.
4. The v1 release branch upgraded Next.js to 16.3.0, clearing the production dependency audit, and finalized this owner handover.
5. The dashboard visual refresh introduced a responsive command-center style for all four roles, with central color tokens, clearer daily actions, and touch-friendly cards.
6. Persistent light/dark mode added a device-aware initial preference, a browser-saved explicit choice, pre-render theme application, and an accessible theme toggle across protected and public access screens.
