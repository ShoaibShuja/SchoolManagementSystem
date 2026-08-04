# Jahan School Management System

Single-school management application for fixed Admin, Teacher, Student, and Parent roles. It provides records, academic setup, attendance, timetable, exams/results/PDF report cards, announcements, portals, manual fees, and an admin dashboard.

The authenticated experience uses a responsive, token-driven dashboard design shared across all roles, including a persistent light/dark mode preference. School colors remain centralized in `app/globals.css`.

## Stack

Next.js 16 App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase Auth/Postgres/Storage, TanStack Query, React Hook Form, Zod, and `@react-pdf/renderer`.

## Setup

Requires Node.js 20.9+ and a Supabase project.

1. Copy `.env.example` to `.env.local` and add values.
2. Run `npm ci`.
3. Apply `supabase/migrations/` in timestamp order through `20260804001200_strengthen_data_integrity.sql`.
4. Optional for a disposable development or Preview project: run `supabase/seed.sql` in the Supabase SQL Editor to load fictional Afghan school demonstration data and test accounts. Never use this seed in Production.
5. For an empty non-demo project, temporarily set `ADMIN_EMAIL`, `ADMIN_FIRST_NAME`, and `ADMIN_LAST_NAME`; run `npm run bootstrap:admin`; then remove those values.
6. Run `npm run dev`.

## Commands

```text
npm run dev
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm run bootstrap:admin
```

`npm run test:e2e` requires `E2E_BASE_URL` and fictional role accounts. Database tests in `supabase/tests/` require a linked disposable Supabase database.

## Fictional demo data

`supabase/seed.sql` creates 48 fictional students across Grade 7-9 sections A/B, eight teachers, 48 guardians, attendance, a conflict-free weekly timetable, published and draft exams, grades, fee records/payments, and targeted announcements. It also creates representative Admin, Teacher, Student, and Parent accounts. The shared non-production password is documented at the top of the SQL file. Apply it only after migrations 001-012 in a disposable project. It resolves existing academic setup records by their business keys, so it can coexist with the earlier lightweight demo seed.

## Environment variables

- Browser-safe: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`
- Server-only: `SUPABASE_SERVICE_ROLE_KEY`
- Bootstrap only: `ADMIN_EMAIL`, `ADMIN_FIRST_NAME`, `ADMIN_LAST_NAME`
- Reserved, inactive email configuration: `RESEND_API_KEY`, `ANNOUNCEMENT_FROM_EMAIL`

Never commit `.env` files or expose the service-role key to browser code.

## Migrations, testing, and deployment

Migrations are forward-only. Promote them development → Preview → Production, take a backup before Production, verify migration history, and never edit a migration that has been applied. Storage buckets and private Storage policies are set up by migration `004`; workflow hardening begins in migration `011`.

GitHub Actions runs clean install, lint, typecheck, tests, and build. Vercel uses `vercel.json`; configure separate Supabase projects and environment values for Preview and Production, then complete role, RLS, Storage, accessibility, mobile, and deployment smoke checks before release.

See the beginner [project guide](docs/PROJECT_GUIDE.md), current [release state](PROJECT_STATE.md), and [handover checklist](docs/HANDOVER_CHECKLIST.md).
