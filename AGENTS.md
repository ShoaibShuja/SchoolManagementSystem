<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Jahan School Management System Instructions

Act as a senior full-stack engineer, software architect, database designer, Supabase security specialist, QA engineer, technical writer, and senior UI/UX designer.

## Project purpose

Build a production-ready, single-school management web application that is easy for nontechnical users to understand and operate. The interface must be simple, minimal, responsive, professional, and visually refined without unnecessary decoration or complexity.

## Primary users

1. Admin
2. Teacher
3. Student
4. Parent

## Technology stack

- Next.js App Router
- TypeScript with strict mode
- Tailwind CSS
- shadcn/ui
- Supabase Postgres, Auth, and Storage
- Supabase Realtime only where it provides clear value
- Supabase Edge Functions only where necessary
- TanStack Query
- React Hook Form
- Zod
- Resend or Supabase built-in authentication emails
- @react-pdf/renderer
- Vercel
- GitHub

## Light-mode brand colors

The user will provide two main light-mode colors. Until then, use semantic CSS variables with temporary neutral values. Keep visual branding centralized and do not spread raw color values throughout components.

## Design principles

- Minimal, calm, responsive, accessible, and professionally refined interface
- Clear hierarchy, generous spacing, readable typography, and strong text contrast
- Consistent layouts, few colors, simple icons, clear form labels, helpful empty states, and predictable navigation
- No unnecessary animation, excessive gradients, glass effects, shadows, decorative cards, dense dashboards, hidden critical actions, or technical user-facing labels

## Scope

Implement only the following features:

1. Role-based authentication for the four fixed roles, each with a properly scoped dashboard. Do not build configurable sub-roles.
2. Student records: personal and academic profile, admission or enrollment number, enrollment date, class and section, guardian information, and status.
3. Teacher and staff records: personal profile, subjects, assigned classes and sections, and employment status.
4. Class and section management: classes, sections, academic years, terms, teacher assignments, and student enrollments.
5. Attendance: daily marking by assigned teachers; admin summaries; self-service student access; linked-child parent access.
6. Gradebook and results: exams and terms, subject marks, maximum-mark validation, automatic totals, averages, and grades; scoped teacher editing; read-only student and parent access.
7. PDF report cards or result slips using @react-pdf/renderer, including student identity, term, marks, total, average, grade, attendance summary, and school identity.
8. Timetables: weekly section, teacher, and student views with practical conflict prevention.
9. Announcements: authorized admin and teachers can target all users, roles, classes, or sections; students and parents are read-only.
10. Parent portal: linked-child attendance, grades, fee records, relevant timetable, and announcements, all read-only.
11. Manual fee record-keeping: due dates, manual payment entries, paid/partially paid/overdue/unpaid statuses; admin-only editing and scoped read-only access.
12. Admin dashboard: active student and teacher totals, current-day attendance rate, pending or overdue fees, recent announcements, and useful operational summaries.

Never implement online payments, library management, transport tracking, hostel management, payroll or full HR, inventory, multi-school or multi-tenant architecture, LMS features, video conferencing, SMS, biometric or RFID attendance, AI chatbots, predictive analytics, native mobile apps, complex configurable permissions, i18n infrastructure, or unrequested enterprise modules.

## Source materials

Treat the project proposal, Level 0 DFD, Level 1 DFD, and ERD as conceptual source materials. The external actors are Admin, Teacher, Student, and Parent. The main processes are user and role management; student and staff management; academic management; attendance; gradebook and results; fees; announcements; reports and dashboard. Validate, normalize, and correct the implementation schema where necessary rather than copying visual diagram mistakes.

## Supabase authentication and security

- Never store application passwords or password hashes in project tables. Supabase Auth owns credentials; application tables reference `auth.users.id`.
- Apply Row Level Security to every exposed table and server-side authorization in addition to UI restrictions.
- Never expose the Supabase service-role key to the browser. Use server-only code for privileged user invitation or administration.
- Teachers may access only assigned academic records; students only their own; parents only linked-child records; admins receive full authorized access.
- Apply suitable Storage policies, validate all inputs with Zod, never trust client-provided role or ownership values, and protect sensitive exports and generated documents.

## Architecture principles

- Prefer Server Components for initial reads and static structure. Use Client Components only when interactivity requires them.
- Use TanStack Query for interactive client-side server state, React Hook Form and shared Zod schemas for forms.
- Keep business logic out of large page components; organize database queries in data-access modules; build reusable domain-focused components.
- Avoid premature abstraction and duplicate query or validation logic.
- Paginate potentially large tables and avoid downloading complete tables when a page is sufficient.
- Use database constraints alongside client validation.
- Version every database change through Supabase migrations and preserve strict TypeScript without `any`.

## Required documentation

Maintain these files after every build-mode prompt:

### `PROJECT_STATE.md`

Keep concise and include: current phase, current branch, last completed prompt, completed work, in-progress work, remaining work, important architecture decisions, database migrations, implemented routes, environment variables, known issues, test and build status, latest important commits, and recommended next prompt.

### `docs/PROJECT_GUIDE.md`

Write for a beginner project owner and keep it practical and reasonably short, without large code listings. Maintain relevant sections for project overview, roles, features, folder structure, setup, environment variables, database and initial admin setup, user manuals, branding and school-information changes, record management, deployment, backup and maintenance, troubleshooting, development phases, important changes, and known limitations.

### `README.md`

Keep concise and developer-focused. Do not duplicate the complete user guide.

## Git rules

- Never commit `.env` files or secrets.
- Use a separate branch for each major phase or feature group.
- Inspect `git status` before and after changes.
- Make atomic conventional commits after meaningful milestones; do not combine unrelated changes.
- Do not rewrite or delete working features without a documented reason.
- Do not merge to `main` automatically. Push only when access and permission are available.
- Report the branch and commit hashes after finishing.

## Quality rules

Before declaring a build prompt complete, run linting, TypeScript checking, relevant tests, and a production build; check database migrations where applicable; test affected role permissions; review desktop and mobile layouts; and check empty, loading, success, validation, and error states. Report failures honestly and never claim a command passed unless it ran successfully.

## Working method

1. Inspect the existing code and documentation.
2. Summarize the current state.
3. Form an implementation plan.
4. Implement in small steps.
5. Validate each major step.
6. Update documentation.
7. Commit logical changes.
8. Provide a completion report.

Do not implement features outside the defined scope. When an assumption is needed, choose the simplest safe and maintainable option, record it in `PROJECT_STATE.md`, and continue unless it could cause destructive data loss or a serious security issue.
