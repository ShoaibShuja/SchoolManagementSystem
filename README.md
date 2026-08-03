# Jahan School Management System

A production-focused, single-school management application built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, and Supabase.

## Current status

The core MVP, academic structure, and assessment workflows are source-complete and locally validated. Administrators can configure exams and publish complete results; teachers enter grades only for assigned papers; students and parents see published results and secure PDF report cards. It is not yet release-approved because migrations, live Auth, and executable RLS isolation checks still need a linked Supabase project.

## Local setup

1. Install Node.js 20.9 or newer.
2. Copy `.env.example` to `.env.local` and supply Supabase values.
3. Run `npm install`.
4. Run `npm run dev` and open `http://localhost:3000`.

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
npm run bootstrap:admin
```

## Environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` server-only. Never expose it to the browser.

Apply migrations with the official Supabase CLI from a supported development host before running the application against a database, through `20260802000800_add_exam_gradebook_and_publication_workflows.sql`. For a safe demonstration database, use only the clearly fictional `.invalid` records in `supabase/seed.sql`; it contains no usable passwords and must not be used in production. See [docs/PROJECT_GUIDE.md](docs/PROJECT_GUIDE.md) and [docs/MVP_AUDIT.md](docs/MVP_AUDIT.md) for setup, verification, records, attendance, academic setup, exams, and report cards.

See [docs/PROJECT_GUIDE.md](docs/PROJECT_GUIDE.md) for owner-focused setup and [PROJECT_STATE.md](PROJECT_STATE.md) for current technical progress.
