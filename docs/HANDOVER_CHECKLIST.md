# Production Handover Checklist

Complete and record the owner, date, and location of evidence for every item. Do not put secrets in this file.

## Ownership and access

- [ ] Repository is owned by the school or approved organization, with at least two GitHub administrators and documented recovery access.
- [ ] GitHub Actions, branch protection, release permissions, and billing contacts are owned by the school.
- [ ] Supabase organization/project ownership, billing, MFA, recovery contacts, and database access are owned by the school.
- [ ] Vercel team/project ownership, billing, MFA, recovery contacts, and production deployment access are owned by the school.
- [ ] Domain registrar, DNS, and renewal contact are owned by the school; HTTPS domain is confirmed in Vercel and Supabase Auth.
- [ ] Resend ownership, domain verification, sending policy, and billing are confirmed only if announcement email is approved and enabled.

## Secure configuration

- [ ] Preview and Production use separate Supabase projects and separate Vercel environment values.
- [ ] Required environment values are present without recording values here: Supabase URL, publishable key, site URL, and server-only service-role key.
- [ ] Bootstrap-only `ADMIN_*` values were removed after the first invitation; no secrets or `.env` files are committed.
- [ ] Supabase Auth Site URL and redirect URLs include the final HTTPS domain and required Preview URLs.
- [ ] Storage buckets are private; Vercel Firewall rate limits protect report-card and account-invitation endpoints.

## Release evidence

- [ ] All migrations 001–012 were applied in order to Preview, migration history was checked, and pgTAP tests passed.
- [ ] RLS and Storage isolation were tested using fictional Admin, Teacher, Student, and Parent accounts.
- [ ] The Playwright role suite passed against Preview, with no production data or credentials.
- [ ] Accessibility scan and visual checks passed at 320px, 768px, and 1280px, including keyboard navigation, focus, errors, loading, empty, and success states.
- [ ] Production deployment configuration and custom domain were reviewed; Production smoke test passed for all four roles.
- [ ] Report-card authorization, manual-payment overpayment rejection, published-grade lock, private photo access, and unauthorized route handling were tested.

## Operations

- [ ] Backups/PITR are enabled where supported; a manual backup was taken before launch and a non-production restore was tested.
- [ ] Initial administrator credentials and recovery method were given privately to the authorized owner. Passwords are managed only by Supabase Auth.
- [ ] Support owner, technical maintainer, incident contact, access-review owner, and backup-restore owner are named and understand their responsibilities.
- [ ] A monthly maintenance slot and quarterly restore/access review are on the school calendar.

## Release decision

- [ ] Every relevant check above passed and evidence is stored in the school-controlled repository or operations record.
- [ ] The release approver has recorded the final commit, deployment URL, migration level, backup timestamp, and approval date.

If any security, migration, role-isolation, build, or data-integrity check fails, stop release promotion and correct it in Preview before Production.
