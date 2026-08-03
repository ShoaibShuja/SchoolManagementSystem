# Jahan School Management System v1.0.0 Release Notes

## Release candidate summary

This release delivers the complete single-school management system: fixed role access, records, academic setup, attendance, timetables, results and PDF report cards, announcements, student/parent portals, manual fee records, and the admin dashboard.

## Security and reliability

- Supabase RLS and server-side role guards scope access to Admin, Teacher, Student, and Parent data.
- Fee/payment workflows, student creation, enrollment capacity, and result publication use authoritative transactional database workflows.
- Fee overpayments and paid-record mutation are blocked; grade history is protected after publication.
- Private Storage, safe API failures, private no-store report cards, input validation, and security headers are in place.
- Next.js and matching ESLint configuration were updated to 16.3.0; the production dependency audit reports 0 vulnerabilities.

## Quality and operations

- GitHub Actions validates clean install, lint, typecheck, tests, and build.
- Vercel configuration, pgTAP structural tests, and environment-gated Playwright role tests are included.
- Beginner owner instructions and a production handover checklist are available in `docs/`.

## Required release gates

This is **not yet approved for production**. Before creating the `v1.0.0` tag or deploying Production, apply migrations 001–012 to a disposable Supabase project and record passing pgTAP, Auth/RLS/Storage isolation, fictional-account browser E2E, accessibility, mobile visual, Preview, backup/restore, and Production smoke-test evidence.

## Intentional limitations

- No online payments or other excluded enterprise modules.
- Announcement email remains disabled pending an approved delivery and consent policy.
- Platform-level Vercel Firewall rate limits remain required alongside process-local application throttling.
