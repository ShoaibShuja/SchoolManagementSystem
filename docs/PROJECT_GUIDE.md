# Jahan School Management System Guide

## Project overview

Jahan School Management System is a single-school web application for administrators, teachers, students, and parents. It is designed to be simple to operate on desktop and mobile devices.

## Current development phase

The core MVP, academic/timetable, and assessment phases are complete in source code and have passed local tests, linting, and type checking. Administrators can manage exams, subject papers, and publication; teachers enter grades for assigned papers; students and parents can see only published results and their authorized PDF report cards. A linked Supabase project must still verify migrations, live Auth, RLS isolation, and Storage before a production release. Fees and announcements are not available yet.

## Main user roles

- **Admin:** manages school records and daily operations.
- **Teacher:** works with assigned classes, attendance, and later gradebooks.
- **Student:** later views personal attendance, timetable, and results.
- **Parent:** later views information for linked children.

## Folder structure

- `app/` contains pages, route groups, and global UI states.
- `components/admin/` contains dashboard, student, teacher, class, section, and form-dialog interfaces.
- `components/academics/` contains academic management and mobile-friendly weekly timetable views.
- `components/results/` contains exam setup, grade-entry, results, and PDF report-card interfaces.
- `components/` contains reusable interface pieces, forms, and the application shell.
- `lib/admin/` contains server-only data access, API guards, Zod schemas, DTOs, filters, and account-linking logic.
- `app/api/admin/` contains protected endpoints used by interactive admin tables.
- `app/api/attendance/` contains role-protected attendance roster, save, and admin review endpoints.
- `components/attendance/` contains the mobile-friendly marking workflow, summaries, and role dashboards.
- `lib/attendance/` contains attendance DTOs, schemas, data access, API guards, and summary helpers.
- `lib/academics/` contains academic/timetable DTOs, Zod schemas, server-only data access, and scoped portal queries.
- `lib/results/` contains shared calculations, gradebook schemas, server-only result access, and DTOs used by the screen and PDF.
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

## Demonstration setup

Use a separate Supabase development or demonstration project, never the production project.

1. Apply every migration through `20260802000800_add_exam_gradebook_and_publication_workflows.sql` in order.
2. Optionally run `supabase/seed.sql` for clearly fictional `example.invalid` school records and attendance samples. It includes no usable password or real personal data.
3. Configure environment variables and run `npm run bootstrap:admin` to create the first administrator through Supabase Auth.
4. Sign in as the administrator, then create or invite separate test accounts for each role. Link only test student and parent profiles to the seed records.
5. Use the checklist in `MVP_AUDIT.md` before demonstrating or approving the release.

Do not run the seed in production, and do not replace the fictional examples with real personal data for a demo.

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
- Once a student has a linked account, the student edit form can upload a private JPEG, PNG, or WebP profile image up to 5 MB.
- Administrators use **Academic setup** to manage the school calendar, terms, active subjects, teacher assignments, enrollment history review, and the weekly timetable.
- Teachers see only their assigned subjects, sections, scheduled lesson count, and weekly timetable. Students see the timetable for their current section. Parents see timetables for linked children only.
- Administrators manage assessment setup and publish complete results. Teachers have only their assigned gradebooks. Students and parents see published results only, with a private report-card download.

## Attendance manual

### Teachers

1. Open **Attendance**. Only current sections assigned to you are shown.
2. Choose a section and date. The roster contains only actively enrolled students for that date.
3. Use **All present**, then change individuals to absent, late, or excused and add short notes if needed.
4. Save. Re-saving the same section and date updates records instead of creating duplicates.

### Administrators

1. Open **Attendance** to make authorized corrections.
2. Use date, class, section, student, and status filters to review saved records and who saved them.
3. The dashboard shows current-day coverage and pending attendance records.

### Students and parents

- Students can view only their own attendance summary and recent records.
- Parents select a linked child and view that child’s attendance only. These pages are read-only.

## Admin record management

1. Open **Students** to add a learner, their admission information, current academic-year section, and primary guardian. Leave the academic year and section blank together when the student is not ready for placement.
2. Use the student edit action to change a current section. The previous active enrollment is recorded as transferred, and a full destination section is rejected.
3. Open **Teachers** to maintain employee number, contact information, qualification, and employment status. Staff records can exist without a login account.
4. Open **Classes** to create grades and sections. Set a sensible capacity before enrollment. A class or section with dependent records cannot be deleted.
5. Use the optional account email on a new or existing student or teacher record to send a secure invitation. “Activated” means an Auth profile is linked; it does not mean the person has necessarily completed their invitation yet.

## Academic setup and timetable manual

### Academic years and terms

1. Open **Academic setup** as an administrator and create the academic year with its first and last day.
2. Mark only the school’s operating year as **Current**. The database prevents more than one current year.
3. Add terms under that year. Each term must fall inside the year and cannot overlap another term.
4. Archive old years instead of deleting them. Historical enrollments, attendance, and future results depend on those records.

### Subjects and teacher assignments

1. Add each subject with a clear name and short code. Active codes must be unique. Set a subject inactive rather than deleting it when it has historical use.
2. Create one assignment for each teacher, subject, section, and academic year combination.
3. An assignment is the source of truth for teacher access. A teacher can see only their own assignments and related timetable entries.
4. The assignment list displays how many weekly lessons have been scheduled, making unplanned workloads easy to spot.

### Weekly timetable

1. Add a teacher assignment before adding its lesson.
2. Choose the academic year, assignment, weekday, start and end times, and optionally a room.
3. The system rejects reversed times and overlapping lessons for the same section, teacher, or named room. Adjacent lessons are allowed.
4. Timetables are shown as weekday groups instead of a dense grid, which also works well on mobile screens.
5. To adjust a student’s current placement, use the student record transfer flow. The enrollment review is read-only so historical records are not accidentally reassigned.

## Exams, gradebooks, and report cards

### Exam setup and publication

1. Open **Exams and results** as an administrator. Create an exam with its term, first and last exam dates, and a draft, open, or closed status.
2. Add each subject paper with its section, subject, date, maximum marks, and optional passing mark. The date must fall in the selected term, and passing marks cannot exceed maximum marks.
3. Teachers can enter grades while the exam is draft or open. Administrators should publish only after every enrolled student has a grade, absence, or exemption for each paper.
4. Publishing makes results visible to the related student and parent accounts, and locks all grade changes. Draft and open results remain private to permitted staff.

### Teacher grade entry

1. Open **Gradebooks**. Only papers that match your teacher assignment are displayed.
2. Enter a mark from zero to the paper maximum, or select **Absent** or **Exempt**. Add a short remark if useful.
3. Select **Save draft grades**. The latest editor and prior changes are retained for audit purposes.
4. Published and closed gradebooks are read-only. Ask an administrator to resolve an issue before publication.

### Student, parent, and report-card access

1. Students open **Results** to see their own published results. Parents use **Results** and select a linked child when there is more than one.
2. Each result lists subject marks, maximums, grades, pass/fail status, total, average, and attendance where records exist.
3. Use **Download report card** to create a private PDF. The filename includes the admission number and exam name; it includes school identity, student and class details, term, marks, totals, attendance, generated date, and signature placeholders.
4. Result calculations use one shared rule set for the screen and PDF. Missing draft marks are shown as missing; publication prevents incomplete result sets.

## Announcements and portals

- Admins can create, edit, publish, return to draft, and archive announcements. They may target all users, roles, classes, sections, or academic years.
- Teachers can manage only their own announcements and may target only their assigned sections. The database enforces this scope.
- Students and parents see only published, unexpired announcements that match their role or linked academic records. Parent academic information is read-only.
- Student and parent dashboards provide concise links to timetable, attendance, results/report cards, announcements, and a fee-record placeholder.
- Optional announcement email uses server-only `RESEND_API_KEY` and `ANNOUNCEMENT_FROM_EMAIL`. Publishing remains available when they are absent; delivery is currently a safe no-op pending approved recipient resolution.

## Deployment overview

The intended deployment is Vercel with Supabase. Add the same environment variables in Vercel project settings, use a separate production Supabase project, and apply only versioned migrations. The service-role key belongs only in Vercel server environment settings, never in `NEXT_PUBLIC_` variables.

## Known limitations

- The release is not approved until database migrations, live Auth, RLS isolation, direct-route access, and private Storage policies are exercised in a real Supabase environment.
- Profile-image uploads need live private-Storage verification before production use.
- Attendance, academic/timetable, gradebook, publication, and report-card access behavior need live Supabase verification before production use.
- Fee records remain a placeholder. Optional Resend delivery is intentionally disabled pending approved recipient resolution and live verification.
- The repository includes a pgTAP database test foundation, but its execution requires a Supabase database environment.
