# Jahan School Management System

Single-school management application built with Next.js 16, TypeScript, Tailwind CSS, Supabase, TanStack Query, React Hook Form, Zod, and `@react-pdf/renderer`.

## Status

Source-level production hardening is complete. Production release requires a disposable Supabase verification run, then preview and production smoke tests. See [the owner guide](docs/PROJECT_GUIDE.md) and [current project state](PROJECT_STATE.md).

## Local setup

1. Install Node.js 20.9 or later.
2. Copy `.env.example` to `.env.local` and provide the required values.
3. Apply Supabase migrations in timestamp order through `20260804001200_strengthen_data_integrity.sql`.
4. Run `npm run bootstrap:admin` once with bootstrap-only administrator variables.
5. Run `npm run dev`.

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

`test:e2e` is environment-gated and requires fictional test accounts. It never uses production credentials.

## Environment variables

Public browser values: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`.

Server-only: `SUPABASE_SERVICE_ROLE_KEY`. Never commit it or prefix it with `NEXT_PUBLIC_`.

See [docs/PROJECT_GUIDE.md](docs/PROJECT_GUIDE.md) for deployment, migration, backup, recovery, and security operations.
