# Jahan School Management System Guide

## Project overview

Jahan School Management System is a single-school web application for administrators, teachers, students, and parents. It is designed to be simple to operate on desktop and mobile devices.

## Current development phase

The administrative record-management MVP is complete in source code. Administrators can manage students, teachers, classes, sections, guardian information, student transfers, and optional account invitations. Daily attendance marking, results, fees, timetables, and announcements are not available yet.

## Main user roles

- **Admin:** manages school records and daily operations.
- **Teacher:** works with assigned classes, attendance, and later gradebooks.
- **Student:** later views personal attendance, timetable, and results.
- **Parent:** later views information for linked children.

## Folder structure

- `app/` contains pages, route groups, and global UI states.
- `components/admin/` contains dashboard, student, teacher, class, section, and form-dialog interfaces.
- `components/` contains reusable interface pieces, forms, and the application shell.
- `lib/admin/` contains server-only data access, API guards, Zod schemas, DTOs, filters, and account-linking logic.
- `app/api/admin/` contains protected endpoints used by interactive admin tables.
- `docs/` contains owner-facing project documentation.
- `supabase/` contains versioned database migrations, Storage policies, local seed data, and database tests.
- `scripts/` contains the server-only initial-admin bootstrap command.

## Local setup

1. Install Node.js 20.9 or newer.
2. Copy `.env.example` to `.env.local`.
3. Add the Supabase project URL and publishable key.
4. Keep the service-role key private. It belongs only in `.env.local` or secure deployment settings.
5. Run `npm install`.
6. Run `npm run dev`.
7. Open `http://localhost:3000`.

## Required environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser-safe Supabase publishable key. |
| `NEXT_PUBLIC_SITE_URL` | Local or deployed application URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key for future invitation and bootstrap tasks. Never expose it in browser code. |

## Initial admin setup

1. Create or select the Supabase project for the environment.
2. Apply the versioned migrations using the official Supabase CLI from a supported development host or through the Supabase SQL migration workflow.
3. Add the required environment variables locally and in the deployment environment.
4. Set `ADMIN_EMAIL`, `ADMIN_FIRST_NAME`, and `ADMIN_LAST_NAME` only in the terminal session that will create the first administrator.
5. Run `npm run bootstrap:admin`.
6. Open the invitation email and set the administrator password through Supabase Auth.

The bootstrap command refuses to create a second admin profile. Never place application passwords or password hashes in database tables, seed files, or source code.

## Database setup

Database changes live in `supabase/migrations/` and must be applied in timestamp order. The schema includes profiles, people, academic structure, assignments, attendance, assessments, fees, announcements, RLS, and private Storage buckets.

For local development, `supabase/seed.sql` creates clearly labelled example identities and school records. The seeded Auth rows have no usable password, are for local database tests only, and must never be used in production.

RLS is enabled for every public application table. Admins manage records; teachers are limited to assigned sections and subjects; students see only their own records; parents see only linked children. The application also checks roles on the server before rendering protected routes.

## How to change branding and colors

The future primary and accent school colors are centralized in `app/globals.css` as `--brand` and `--accent`. Do not replace colors inside individual components. The temporary values are neutral until the school supplies final colors.

## Current user experience

- The sign-in page uses Supabase Auth and routes active profiles to the correct role dashboard.
- The sign-out action ends the browser session through a protected route handler.
- Administrators have a concise dashboard with active student and teacher totals, class and section counts, and today’s attendance progress when records exist.
- Administrators can search, filter, paginate, create, edit, view, activate, and deactivate student records. Every student has a primary guardian contact and can be enrolled or moved to one section per academic year.
- Administrators can search, filter, create, edit, and view teacher and basic staff records. Employment details are record-keeping only; there is no payroll or HR module.
- Administrators can create, edit, and remove classes and sections. Sections enforce their configured capacity for active enrollments. Deletion is prevented when a record is still in use.
- A school record does not need a login account. When an administrator supplies a student or teacher email, the system uses the server-only invitation process to create an Auth profile and link it to that record. Never use this screen to share or store passwords.

## Admin record management

1. Open **Students** to add a learner, their admission information, current academic-year section, and primary guardian. Leave the academic year and section blank together when the student is not ready for placement.
2. Use the student edit action to change a current section. The previous active enrollment is recorded as transferred, and a full destination section is rejected.
3. Open **Teachers** to maintain employee number, contact information, qualification, and employment status. Staff records can exist without a login account.
4. Open **Classes** to create grades and sections. Set a sensible capacity before enrollment. A class or section with dependent records cannot be deleted.
5. Use the optional account email on a new or existing student or teacher record to send a secure invitation. “Activated” means an Auth profile is linked; it does not mean the person has necessarily completed their invitation yet.

## Deployment overview

The intended deployment is Vercel with Supabase. Add the same environment variables in Vercel project settings, use a separate production Supabase project, and apply only versioned migrations. The service-role key belongs only in Vercel server environment settings, never in `NEXT_PUBLIC_` variables.

## Known limitations

- Database migrations and policies must still be applied and exercised in a real Supabase environment.
- Profile-photo upload UI is deferred pending live private-Storage verification, even though the bucket and policies are ready.
- Daily teacher attendance marking and complete admin attendance summaries are not implemented; the dashboard only reports stored attendance records for today.
- Results, fees, timetables, and announcements are not implemented yet.
- The repository includes a pgTAP database test foundation, but its execution requires a Supabase database environment.
