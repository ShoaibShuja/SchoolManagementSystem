# Jahan School Management System

A production-focused, single-school management application built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, and Supabase.

## Current status

The application foundation is complete. Authentication utilities, the responsive shell, placeholder role dashboards, shared UI primitives, and project documentation are in place. Database migrations and business modules have not started.

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
npm run build
```

## Environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` server-only. Never expose it to the browser.

See [docs/PROJECT_GUIDE.md](docs/PROJECT_GUIDE.md) for owner-focused setup and [PROJECT_STATE.md](PROJECT_STATE.md) for current technical progress.
