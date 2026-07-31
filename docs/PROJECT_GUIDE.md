# Jahan School Management System Guide

## Project overview

Jahan School Management System is a single-school web application for administrators, teachers, students, and parents. It is designed to be simple to operate on desktop and mobile devices.

## Current development phase

The shared application foundation is complete. The next phase creates the secure Supabase database, roles, and permissions. Student records, attendance, results, fees, and other school workflows are not available yet.

## Main user roles

- **Admin:** manages school records and daily operations.
- **Teacher:** works with assigned classes, attendance, and later gradebooks.
- **Student:** later views personal attendance, timetable, and results.
- **Parent:** later views information for linked children.

## Folder structure

- `app/` contains pages, route groups, and global UI states.
- `components/` contains reusable interface pieces, forms, and the application shell.
- `lib/` contains environment checks, Supabase helpers, query keys, and shared utilities.
- `docs/` contains owner-facing project documentation.
- `supabase/` will contain versioned database migrations and tests in the next phase.

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

This is not available yet. The next phase will provide a secure, documented first-admin bootstrap process. Do not create a public signup page or store passwords in project tables.

## How to change branding and colors

The future primary and accent school colors are centralized in `app/globals.css` as `--brand` and `--accent`. Do not replace colors inside individual components. The temporary values are neutral until the school supplies final colors.

## Current user experience

- The sign-in page is ready for Supabase Auth configuration.
- Each role has a responsive placeholder dashboard and role-specific navigation.
- School records and features will appear progressively as development phases are completed.

## Deployment overview

The intended deployment is Vercel with Supabase. Add the same environment variables in Vercel project settings, use a separate production Supabase project, and apply only versioned migrations. Deployment, backups, and monitoring guidance will be expanded before launch.

## Known limitations

- No production database schema or RLS policies exist yet.
- No school records, attendance, parent links, results, fees, or announcements are implemented.
- No automated tests exist yet.
