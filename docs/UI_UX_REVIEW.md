# UI/UX review checklist

Reviewed on 2026-08-03 for admin, teacher, student, and parent routes.

- Shared shell: fixed mobile drawer width, page skip link, active navigation semantics, touch-sized links, and protected main-content target.
- Responsive layout: standard `max-w-7xl` content width, 16/24/32px responsive gutters, wrapping page actions, scrollable data tables, and viewport-safe dialogs.
- Forms and feedback: labels now connect error and helper text to supported controls; errors announce through `role="alert"`; existing Radix dialogs retain focus handling and escape dismissal.
- Operational screens: attendance and grade entry already use stacked record cards on phones; timetable uses day cards; tables preserve horizontal access rather than clipping data.
- Visual consistency: centralized neutral semantic tokens remain in `app/globals.css`; no final brand colors have been supplied. Buttons, cards, borders, states, and focus use tokens only.
- Accessibility: visible focus treatment, 40px minimum standard controls, 44px navigation targets, reduced-motion support, non-color status labels, and icon button names were checked.

Remaining live QA: inspect all routes at 320px, 768px, and 1280px after connecting a Supabase environment with representative records. Confirm keyboard trapping in each live dialog and use an automated browser accessibility scan if one is configured for deployment.
