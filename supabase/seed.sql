-- Local development only. These identities have no usable password and cannot be used to sign in.
-- Do not run this file against production.
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seed-admin@example.invalid', '', timezone('utc', now()), '{"provider":"email","providers":["email"]}', '{"development_seed":true}', timezone('utc', now()), timezone('utc', now())),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seed-teacher@example.invalid', '', timezone('utc', now()), '{"provider":"email","providers":["email"]}', '{"development_seed":true}', timezone('utc', now()), timezone('utc', now())),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seed-student-one@example.invalid', '', timezone('utc', now()), '{"provider":"email","providers":["email"]}', '{"development_seed":true}', timezone('utc', now()), timezone('utc', now())),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seed-student-two@example.invalid', '', timezone('utc', now()), '{"provider":"email","providers":["email"]}', '{"development_seed":true}', timezone('utc', now()), timezone('utc', now())),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seed-parent@example.invalid', '', timezone('utc', now()), '{"provider":"email","providers":["email"]}', '{"development_seed":true}', timezone('utc', now()), timezone('utc', now()))
on conflict (id) do nothing;

insert into public.profiles (id, role, first_name, last_name)
values
  ('10000000-0000-0000-0000-000000000001', 'admin', 'Seed', 'Admin'),
  ('10000000-0000-0000-0000-000000000002', 'teacher', 'Seed', 'Teacher'),
  ('10000000-0000-0000-0000-000000000003', 'student', 'Seed', 'Student One'),
  ('10000000-0000-0000-0000-000000000004', 'student', 'Seed', 'Student Two'),
  ('10000000-0000-0000-0000-000000000005', 'parent', 'Seed', 'Parent')
on conflict (id) do update set role = excluded.role, first_name = excluded.first_name, last_name = excluded.last_name;

insert into public.academic_years (id, name, starts_on, ends_on, status)
values ('20000000-0000-0000-0000-000000000001', '2026-2027', '2026-03-21', '2027-03-20', 'current')
on conflict (id) do update set name = excluded.name, starts_on = excluded.starts_on, ends_on = excluded.ends_on, status = excluded.status;

insert into public.terms (id, academic_year_id, name, starts_on, ends_on, status)
values ('20000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'First Term', '2026-03-21', '2026-08-31', 'current')
on conflict (id) do update set status = excluded.status;

insert into public.classes (id, name, display_order)
values ('30000000-0000-0000-0000-000000000001', 'Grade 1', 1)
on conflict (id) do update set name = excluded.name, display_order = excluded.display_order;

insert into public.sections (id, class_id, name)
values ('30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'A')
on conflict (id) do update set name = excluded.name;

insert into public.subjects (id, code, name)
values
  ('40000000-0000-0000-0000-000000000001', 'MATH', 'Mathematics'),
  ('40000000-0000-0000-0000-000000000002', 'ENG', 'English')
on conflict (id) do update set code = excluded.code, name = excluded.name;

insert into public.teachers (id, profile_id, employee_number, employment_started_on)
values ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'T-0001', '2026-03-21')
on conflict (id) do update set profile_id = excluded.profile_id, employee_number = excluded.employee_number;

insert into public.students (id, profile_id, admission_number, first_name, last_name, enrolled_on)
values
  ('60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'S-0001', 'Seed', 'Student One', '2026-03-21'),
  ('60000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 'S-0002', 'Seed', 'Student Two', '2026-03-21')
on conflict (id) do update set profile_id = excluded.profile_id, admission_number = excluded.admission_number;

insert into public.parents (id, profile_id, first_name, last_name, phone, email)
values ('70000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 'Seed', 'Parent', '+000000000', 'seed-parent@example.invalid')
on conflict (id) do update set profile_id = excluded.profile_id;

insert into public.parent_student_links (parent_id, student_id, relationship, is_primary_contact)
values
  ('70000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 'Parent', true),
  ('70000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000002', 'Parent', false)
on conflict (parent_id, student_id) do update set relationship = excluded.relationship, is_primary_contact = excluded.is_primary_contact;

insert into public.teacher_assignments (id, teacher_id, section_id, subject_id, academic_year_id)
values
  ('80000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001'),
  ('80000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;

insert into public.student_enrollments (id, student_id, academic_year_id, section_id, enrolled_on)
values
  ('90000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '2026-03-21'),
  ('90000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '2026-03-21')
on conflict (id) do nothing;
