# Jahan School Management System

A production-focused, single-school management application built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, and Supabase.

## Current status

The administrative record-management MVP is implemented. It includes secure admin student, guardian, teacher, class, section, enrollment-transfer, optional Auth-account-linking, and dashboard-count modules, backed by versioned Supabase schema/RLS foundations.

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

Apply migrations with the official Supabase CLI from a supported development host before running the application against a database, including `20260802000500_support_admin_record_management.sql`. See [docs/PROJECT_GUIDE.md](docs/PROJECT_GUIDE.md) for the initial administrator procedure and admin record-management instructions.

See [docs/PROJECT_GUIDE.md](docs/PROJECT_GUIDE.md) for owner-focused setup and [PROJECT_STATE.md](PROJECT_STATE.md) for current technical progress.
