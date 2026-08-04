-- Jahan School fictional Demonstration record seed
--
-- Run only in a disposable local, development, or Preview Supabase project
-- after migrations 001-012. Never run this in Production or against real
-- school records. The data is fictional and uses reserved .example.invalid email domains.
--
-- Demo sign-in password for every account below: JahanDemo2026!
--   Admin:   admin@jahan-demo.example.invalid
--   Teacher: farid.ahmadzai@jahan-demo.example.invalid
--   Student: ahmad.ahmadzai@student.jahan-demo.example.invalid
--   Parent:  rahman.ahmadzai@parent.jahan-demo.example.invalid
--
-- Re-running this script preserves the same records. Financial payments and
-- published grades are intentionally insert-only to preserve their histories.

begin;

select pg_advisory_xact_lock(hashtext('jahan-school-fictional-demo-seed-v1'));
set local row_security = off;

-- Auth accounts are deliberately limited to representative users. Every
-- student, guardian, and teacher has a school record, while the accounts below
-- exercise each portal and common RLS paths.
with accounts(id, email, role, first_name, last_name, phone) as (
  values
    ('a1000000-0000-0000-0000-000000000001'::uuid, 'admin@jahan-demo.example.invalid', 'admin'::public.app_role, 'Amina', 'Jafari', '+93700001001'),
    ('a1000000-0000-0000-0000-000000000002'::uuid, 'farid.ahmadzai@jahan-demo.example.invalid', 'teacher'::public.app_role, 'Farid', 'Ahmadzai', '+93700001002'),
    ('a1000000-0000-0000-0000-000000000003'::uuid, 'laila.rahimi@jahan-demo.example.invalid', 'teacher'::public.app_role, 'Laila', 'Rahimi', '+93700001003'),
    ('a1000000-0000-0000-0000-000000000004'::uuid, 'sediqa.wardak@jahan-demo.example.invalid', 'teacher'::public.app_role, 'Sediqa', 'Wardak', '+93700001004'),
    ('a1000000-0000-0000-0000-000000000005'::uuid, 'bashir.noori@jahan-demo.example.invalid', 'teacher'::public.app_role, 'Bashir', 'Noori', '+93700001005'),
    ('a1000000-0000-0000-0000-000000000006'::uuid, 'shukria.safi@jahan-demo.example.invalid', 'teacher'::public.app_role, 'Shukria', 'Safi', '+93700001006'),
    ('a1000000-0000-0000-0000-000000000007'::uuid, 'mubariz.karimi@jahan-demo.example.invalid', 'teacher'::public.app_role, 'Mubariz', 'Karimi', '+93700001007'),
    ('a1000000-0000-0000-0000-000000000008'::uuid, 'wali.mohseni@jahan-demo.example.invalid', 'teacher'::public.app_role, 'Wali', 'Mohseni', '+93700001008'),
    ('a1000000-0000-0000-0000-000000000009'::uuid, 'maryam.habibi@jahan-demo.example.invalid', 'teacher'::public.app_role, 'Maryam', 'Habibi', '+93700001009'),
    ('a1000000-0000-0000-0000-000000000021'::uuid, 'ahmad.ahmadzai@student.jahan-demo.example.invalid', 'student'::public.app_role, 'Ahmad', 'Ahmadzai', '+93700002001'),
    ('a1000000-0000-0000-0000-000000000022'::uuid, 'maryam.rahimi@student.jahan-demo.example.invalid', 'student'::public.app_role, 'Maryam', 'Rahimi', '+93700002002'),
    ('a1000000-0000-0000-0000-000000000023'::uuid, 'zubair.noori@student.jahan-demo.example.invalid', 'student'::public.app_role, 'Zubair', 'Noori', '+93700002003'),
    ('a1000000-0000-0000-0000-000000000024'::uuid, 'fatima.sultani@student.jahan-demo.example.invalid', 'student'::public.app_role, 'Fatima', 'Sultani', '+93700002004'),
    ('a1000000-0000-0000-0000-000000000025'::uuid, 'haroon.wardak@student.jahan-demo.example.invalid', 'student'::public.app_role, 'Haroon', 'Wardak', '+93700002005'),
    ('a1000000-0000-0000-0000-000000000026'::uuid, 'shakila.safi@student.jahan-demo.example.invalid', 'student'::public.app_role, 'Shakila', 'Safi', '+93700002006'),
    ('a1000000-0000-0000-0000-000000000041'::uuid, 'rahman.ahmadzai@parent.jahan-demo.example.invalid', 'parent'::public.app_role, 'Abdul Rahman', 'Ahmadzai', '+93700003001'),
    ('a1000000-0000-0000-0000-000000000042'::uuid, 'nasima.rahimi@parent.jahan-demo.example.invalid', 'parent'::public.app_role, 'Nasima', 'Rahimi', '+93700003002'),
    ('a1000000-0000-0000-0000-000000000043'::uuid, 'karim.noori@parent.jahan-demo.example.invalid', 'parent'::public.app_role, 'Karim', 'Noori', '+93700003003')
)
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
select id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', email,
  crypt('JahanDemo2026!', gen_salt('bf')), timezone('utc', now()),
  jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
  jsonb_build_object('development_seed', true, 'role', role), timezone('utc', now()), timezone('utc', now())
from accounts
on conflict (id) do update set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = timezone('utc', now());

with accounts(id, email) as (
  values
    ('a1000000-0000-0000-0000-000000000001'::uuid, 'admin@jahan-demo.example.invalid'),
    ('a1000000-0000-0000-0000-000000000002'::uuid, 'farid.ahmadzai@jahan-demo.example.invalid'),
    ('a1000000-0000-0000-0000-000000000003'::uuid, 'laila.rahimi@jahan-demo.example.invalid'),
    ('a1000000-0000-0000-0000-000000000004'::uuid, 'sediqa.wardak@jahan-demo.example.invalid'),
    ('a1000000-0000-0000-0000-000000000005'::uuid, 'bashir.noori@jahan-demo.example.invalid'),
    ('a1000000-0000-0000-0000-000000000006'::uuid, 'shukria.safi@jahan-demo.example.invalid'),
    ('a1000000-0000-0000-0000-000000000007'::uuid, 'mubariz.karimi@jahan-demo.example.invalid'),
    ('a1000000-0000-0000-0000-000000000008'::uuid, 'wali.mohseni@jahan-demo.example.invalid'),
    ('a1000000-0000-0000-0000-000000000009'::uuid, 'maryam.habibi@jahan-demo.example.invalid'),
    ('a1000000-0000-0000-0000-000000000021'::uuid, 'ahmad.ahmadzai@student.jahan-demo.example.invalid'),
    ('a1000000-0000-0000-0000-000000000022'::uuid, 'maryam.rahimi@student.jahan-demo.example.invalid'),
    ('a1000000-0000-0000-0000-000000000023'::uuid, 'zubair.noori@student.jahan-demo.example.invalid'),
    ('a1000000-0000-0000-0000-000000000024'::uuid, 'fatima.sultani@student.jahan-demo.example.invalid'),
    ('a1000000-0000-0000-0000-000000000025'::uuid, 'haroon.wardak@student.jahan-demo.example.invalid'),
    ('a1000000-0000-0000-0000-000000000026'::uuid, 'shakila.safi@student.jahan-demo.example.invalid'),
    ('a1000000-0000-0000-0000-000000000041'::uuid, 'rahman.ahmadzai@parent.jahan-demo.example.invalid'),
    ('a1000000-0000-0000-0000-000000000042'::uuid, 'nasima.rahimi@parent.jahan-demo.example.invalid'),
    ('a1000000-0000-0000-0000-000000000043'::uuid, 'karim.noori@parent.jahan-demo.example.invalid')
)
insert into auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at)
select id, id, jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true, 'phone_verified', false), 'email', email, timezone('utc', now()), timezone('utc', now())
from accounts
on conflict (provider_id, provider) do update set
  user_id = excluded.user_id,
  identity_data = excluded.identity_data,
  updated_at = timezone('utc', now());

insert into public.profiles (id, role, first_name, last_name, phone, status)
values
  ('a1000000-0000-0000-0000-000000000001', 'admin', 'Amina', 'Jafari', '+93700001001', 'active'),
  ('a1000000-0000-0000-0000-000000000002', 'teacher', 'Farid', 'Ahmadzai', '+93700001002', 'active'),
  ('a1000000-0000-0000-0000-000000000003', 'teacher', 'Laila', 'Rahimi', '+93700001003', 'active'),
  ('a1000000-0000-0000-0000-000000000004', 'teacher', 'Sediqa', 'Wardak', '+93700001004', 'active'),
  ('a1000000-0000-0000-0000-000000000005', 'teacher', 'Bashir', 'Noori', '+93700001005', 'active'),
  ('a1000000-0000-0000-0000-000000000006', 'teacher', 'Shukria', 'Safi', '+93700001006', 'active'),
  ('a1000000-0000-0000-0000-000000000007', 'teacher', 'Mubariz', 'Karimi', '+93700001007', 'active'),
  ('a1000000-0000-0000-0000-000000000008', 'teacher', 'Wali', 'Mohseni', '+93700001008', 'active'),
  ('a1000000-0000-0000-0000-000000000009', 'teacher', 'Maryam', 'Habibi', '+93700001009', 'active'),
  ('a1000000-0000-0000-0000-000000000021', 'student', 'Ahmad', 'Ahmadzai', '+93700002001', 'active'),
  ('a1000000-0000-0000-0000-000000000022', 'student', 'Maryam', 'Rahimi', '+93700002002', 'active'),
  ('a1000000-0000-0000-0000-000000000023', 'student', 'Zubair', 'Noori', '+93700002003', 'active'),
  ('a1000000-0000-0000-0000-000000000024', 'student', 'Fatima', 'Sultani', '+93700002004', 'active'),
  ('a1000000-0000-0000-0000-000000000025', 'student', 'Haroon', 'Wardak', '+93700002005', 'active'),
  ('a1000000-0000-0000-0000-000000000026', 'student', 'Shakila', 'Safi', '+93700002006', 'active'),
  ('a1000000-0000-0000-0000-000000000041', 'parent', 'Abdul Rahman', 'Ahmadzai', '+93700003001', 'active'),
  ('a1000000-0000-0000-0000-000000000042', 'parent', 'Nasima', 'Rahimi', '+93700003002', 'active'),
  ('a1000000-0000-0000-0000-000000000043', 'parent', 'Karim', 'Noori', '+93700003003', 'active')
on conflict (id) do update set
  role = excluded.role, first_name = excluded.first_name, last_name = excluded.last_name,
  phone = excluded.phone, status = excluded.status, updated_at = timezone('utc', now());

insert into public.academic_years (id, name, starts_on, ends_on, status)
values ('b1000000-0000-0000-0000-000000000001', '2026-2027', '2026-03-21', '2027-03-20', 'current')
on conflict (id) do update set name = excluded.name, starts_on = excluded.starts_on, ends_on = excluded.ends_on, status = excluded.status;

insert into public.terms (id, academic_year_id, name, starts_on, ends_on, status)
values
  ('b2000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'First Term', '2026-03-21', '2026-08-31', 'current'),
  ('b2000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'Second Term', '2026-09-01', '2026-12-31', 'planned'),
  ('b2000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'Third Term', '2027-01-01', '2027-03-20', 'planned')
on conflict (id) do update set name = excluded.name, starts_on = excluded.starts_on, ends_on = excluded.ends_on, status = excluded.status;

insert into public.classes (id, name, display_order)
values
  ('c1000000-0000-0000-0000-000000000001', 'Grade 7', 7),
  ('c1000000-0000-0000-0000-000000000002', 'Grade 8', 8),
  ('c1000000-0000-0000-0000-000000000003', 'Grade 9', 9)
on conflict (id) do update set name = excluded.name, display_order = excluded.display_order;

insert into public.sections (id, class_id, name, capacity)
values
  ('c2000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'A', 35),
  ('c2000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'B', 35),
  ('c2000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', 'A', 35),
  ('c2000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002', 'B', 35),
  ('c2000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000003', 'A', 35),
  ('c2000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000003', 'B', 35)
on conflict (id) do update set class_id = excluded.class_id, name = excluded.name, capacity = excluded.capacity;

insert into public.subjects (id, code, name, description, is_active)
values
  ('c3000000-0000-0000-0000-000000000001', 'MATH', 'Mathematics', 'Numeracy, algebra, geometry, and practical problem solving.', true),
  ('c3000000-0000-0000-0000-000000000002', 'ENG', 'English', 'Reading, writing, speaking, and grammar.', true),
  ('c3000000-0000-0000-0000-000000000003', 'DARI', 'Dari', 'Dari language, literature, and composition.', true),
  ('c3000000-0000-0000-0000-000000000004', 'SCI', 'General Science', 'Life, physical, and earth science foundations.', true),
  ('c3000000-0000-0000-0000-000000000005', 'ISL', 'Islamic Studies', 'Quran, ethics, and Islamic studies.', true),
  ('c3000000-0000-0000-0000-000000000006', 'PAS', 'Pashto', 'Pashto language, reading, and composition.', true),
  ('c3000000-0000-0000-0000-000000000007', 'SOC', 'Social Studies', 'Afghan history, geography, and civic education.', true),
  ('c3000000-0000-0000-0000-000000000008', 'COMP', 'Computer Studies', 'Digital literacy and responsible technology use.', true)
on conflict (id) do update set code = excluded.code, name = excluded.name, description = excluded.description, is_active = excluded.is_active;

insert into public.teachers (id, profile_id, employee_number, first_name, last_name, phone, email, qualification, employment_started_on, status)
values
  ('d1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 'JMS-T-001', 'Farid', 'Ahmadzai', '+93700001002', 'farid.ahmadzai@jahan-demo.example.invalid', 'BSc Mathematics, Kabul University', '2022-03-21', 'active'),
  ('d1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003', 'JMS-T-002', 'Laila', 'Rahimi', '+93700001003', 'laila.rahimi@jahan-demo.example.invalid', 'BA English Language and Literature', '2021-09-01', 'active'),
  ('d1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004', 'JMS-T-003', 'Sediqa', 'Wardak', '+93700001004', 'sediqa.wardak@jahan-demo.example.invalid', 'BA Dari Literature', '2020-03-21', 'active'),
  ('d1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000005', 'JMS-T-004', 'Bashir', 'Noori', '+93700001005', 'bashir.noori@jahan-demo.example.invalid', 'BSc Biology', '2023-03-21', 'active'),
  ('d1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000006', 'JMS-T-005', 'Shukria', 'Safi', '+93700001006', 'shukria.safi@jahan-demo.example.invalid', 'BA Islamic Studies', '2019-03-21', 'active'),
  ('d1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000007', 'JMS-T-006', 'Mubariz', 'Karimi', '+93700001007', 'mubariz.karimi@jahan-demo.example.invalid', 'BA Pashto Literature', '2021-03-21', 'active'),
  ('d1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000008', 'JMS-T-007', 'Wali', 'Mohseni', '+93700001008', 'wali.mohseni@jahan-demo.example.invalid', 'BA History and Geography', '2022-09-01', 'active'),
  ('d1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000009', 'JMS-T-008', 'Maryam', 'Habibi', '+93700001009', 'maryam.habibi@jahan-demo.example.invalid', 'BSc Computer Science', '2023-09-01', 'active')
on conflict (id) do update set
  profile_id = excluded.profile_id, employee_number = excluded.employee_number, first_name = excluded.first_name,
  last_name = excluded.last_name, phone = excluded.phone, email = excluded.email, qualification = excluded.qualification,
  employment_started_on = excluded.employment_started_on, status = excluded.status;

with student_seed(ordinal, first_name, last_name, date_of_birth, section_ordinal) as (
  values
    (1, 'Ahmad', 'Ahmadzai', date '2013-04-12', 1), (2, 'Maryam', 'Rahimi', date '2013-08-24', 1), (3, 'Zubair', 'Noori', date '2013-01-17', 1), (4, 'Fatima', 'Sultani', date '2013-10-05', 1),
    (5, 'Haroon', 'Wardak', date '2013-06-09', 1), (6, 'Shakila', 'Safi', date '2013-02-28', 1), (7, 'Farid', 'Hamdard', date '2013-11-16', 1), (8, 'Lema', 'Habibi', date '2013-07-03', 1),
    (9, 'Omid', 'Karimi', date '2013-03-14', 2), (10, 'Zahra', 'Mohammadi', date '2013-09-21', 2), (11, 'Jawad', 'Hakimi', date '2013-05-27', 2), (12, 'Mahgul', 'Ahmadi', date '2013-12-08', 2),
    (13, 'Najibullah', 'Azizi', date '2013-01-26', 2), (14, 'Sadaf', 'Qasimi', date '2013-08-11', 2), (15, 'Hekmatullah', 'Sadat', date '2013-04-30', 2), (16, 'Rukhsar', 'Bahrami', date '2013-10-19', 2),
    (17, 'Ehsanullah', 'Farahi', date '2012-03-07', 3), (18, 'Nargis', 'Amini', date '2012-07-25', 3), (19, 'Abdul Basir', 'Ahmadi', date '2012-11-02', 3), (20, 'Wajiha', 'Rahmani', date '2012-06-18', 3),
    (21, 'Samiullah', 'Danish', date '2012-02-14', 3), (22, 'Mahboba', 'Akbari', date '2012-09-28', 3), (23, 'Murtaza', 'Haidari', date '2012-05-09', 3), (24, 'Nazia', 'Sultani', date '2012-12-22', 3),
    (25, 'Bilal', 'Yousufi', date '2012-01-13', 4), (26, 'Huma', 'Nazari', date '2012-08-06', 4), (27, 'Shafiqullah', 'Faryabi', date '2012-04-25', 4), (28, 'Farzana', 'Ebrahimi', date '2012-10-17', 4),
    (29, 'Ilyas', 'Omari', date '2012-06-02', 4), (30, 'Tamana', 'Sadat', date '2012-02-20', 4), (31, 'Mustafa', 'Amini', date '2012-11-11', 4), (32, 'Setara', 'Hakimi', date '2012-07-29', 4),
    (33, 'Suhail', 'Rahimi', date '2011-03-18', 5), (34, 'Saliha', 'Wali', date '2011-09-04', 5), (35, 'Qais', 'Ahmadzai', date '2011-05-22', 5), (36, 'Shukria', 'Noori', date '2011-12-01', 5),
    (37, 'Kamil', 'Mohseni', date '2011-01-29', 5), (38, 'Marzia', 'Karimi', date '2011-08-15', 5), (39, 'Faizullah', 'Wardak', date '2011-04-08', 5), (40, 'Benafsha', 'Sediqi', date '2011-10-27', 5),
    (41, 'Hamidullah', 'Safi', date '2011-02-10', 6), (42, 'Rania', 'Farahi', date '2011-07-19', 6), (43, 'Amanullah', 'Qasimi', date '2011-11-26', 6), (44, 'Yasmin', 'Ahmadi', date '2011-06-14', 6),
    (45, 'Sediq', 'Akbari', date '2011-03-02', 6), (46, 'Shabnam', 'Rahmani', date '2011-09-23', 6), (47, 'Abdul Rauf', 'Habibi', date '2011-05-16', 6), (48, 'Mahnaz', 'Azizi', date '2011-12-05', 6)
)
insert into public.students (id, profile_id, admission_number, first_name, last_name, date_of_birth, enrolled_on, status)
select
  ('e1000000-0000-0000-0000-' || lpad(ordinal::text, 12, '0'))::uuid,
  case when ordinal <= 6 then ('a1000000-0000-0000-0000-' || lpad((ordinal + 20)::text, 12, '0'))::uuid else null end,
  'JMS-2026-' || lpad(ordinal::text, 3, '0'), first_name, last_name, date_of_birth, date '2026-03-21', 'active'
from student_seed
on conflict (id) do update set
  profile_id = excluded.profile_id, admission_number = excluded.admission_number, first_name = excluded.first_name,
  last_name = excluded.last_name, date_of_birth = excluded.date_of_birth, enrolled_on = excluded.enrolled_on, status = excluded.status;

with guardians as (
  select
    s.id as student_id, right(s.admission_number, 3)::integer as ordinal, s.last_name,
    (array['Abdul Rahman', 'Nasima', 'Karim', 'Sakina', 'Mohammad Yusuf', 'Parwin', 'Haji Latif', 'Mahboba', 'Fazal Ahmad', 'Sahar', 'Habibullah', 'Ruqia', 'Abdul Qadir', 'Zarmina', 'Nematullah', 'Gulbadan'])[((right(s.admission_number, 3)::integer - 1) % 16) + 1] as first_name
  from public.students s where s.admission_number like 'JMS-2026-%'
)
insert into public.parents (id, profile_id, first_name, last_name, phone, email)
select
  ('f1000000-0000-0000-0000-' || lpad(ordinal::text, 12, '0'))::uuid,
  case when ordinal <= 3 then ('a1000000-0000-0000-0000-' || lpad((ordinal + 40)::text, 12, '0'))::uuid else null end,
  first_name, last_name, '+9370003' || lpad(ordinal::text, 4, '0'), lower('guardian.' || ordinal::text || '@families.jahan-demo.example.invalid')
from guardians
on conflict (id) do update set
  profile_id = excluded.profile_id, first_name = excluded.first_name, last_name = excluded.last_name,
  phone = excluded.phone, email = excluded.email;

insert into public.parent_student_links (parent_id, student_id, relationship, is_primary_contact)
select
  ('f1000000-0000-0000-0000-' || lpad(right(s.admission_number, 3), 12, '0'))::uuid,
  s.id, 'Parent or guardian', true
from public.students s
where s.admission_number like 'JMS-2026-%'
on conflict (parent_id, student_id) do update set relationship = excluded.relationship, is_primary_contact = excluded.is_primary_contact;

insert into public.student_enrollments (id, student_id, academic_year_id, section_id, enrolled_on, status)
select
  ('e2000000-0000-0000-0000-' || lpad(right(s.admission_number, 3), 12, '0'))::uuid,
  s.id, 'b1000000-0000-0000-0000-000000000001',
  ('c2000000-0000-0000-0000-' || lpad((((right(s.admission_number, 3)::integer - 1) / 8) + 1)::text, 12, '0'))::uuid,
  date '2026-03-21', 'active'
from public.students s
where s.admission_number like 'JMS-2026-%'
on conflict (id) do update set student_id = excluded.student_id, academic_year_id = excluded.academic_year_id,
  section_id = excluded.section_id, enrolled_on = excluded.enrolled_on, status = excluded.status;

-- Each subject teacher is assigned to every seeded section. The generated
-- timetable below rotates subjects, preventing section, teacher, and room overlaps.
insert into public.teacher_assignments (id, teacher_id, section_id, subject_id, academic_year_id)
select
  ('d2000000-0000-0000-0000-' || lpad((((teacher_data.ordinal - 1) * 6) + section_data.ordinal)::text, 12, '0'))::uuid,
  teacher_data.id, section_data.id, subject_data.id, 'b1000000-0000-0000-0000-000000000001'
from (
  values
    (1, 'd1000000-0000-0000-0000-000000000001'::uuid), (2, 'd1000000-0000-0000-0000-000000000002'::uuid),
    (3, 'd1000000-0000-0000-0000-000000000003'::uuid), (4, 'd1000000-0000-0000-0000-000000000004'::uuid),
    (5, 'd1000000-0000-0000-0000-000000000005'::uuid), (6, 'd1000000-0000-0000-0000-000000000006'::uuid),
    (7, 'd1000000-0000-0000-0000-000000000007'::uuid), (8, 'd1000000-0000-0000-0000-000000000008'::uuid)
) as teacher_data(ordinal, id)
join (
  values
    (1, 'c2000000-0000-0000-0000-000000000001'::uuid), (2, 'c2000000-0000-0000-0000-000000000002'::uuid),
    (3, 'c2000000-0000-0000-0000-000000000003'::uuid), (4, 'c2000000-0000-0000-0000-000000000004'::uuid),
    (5, 'c2000000-0000-0000-0000-000000000005'::uuid), (6, 'c2000000-0000-0000-0000-000000000006'::uuid)
) as section_data(ordinal, id) on true
join (
  values
    (1, 'c3000000-0000-0000-0000-000000000001'::uuid), (2, 'c3000000-0000-0000-0000-000000000002'::uuid),
    (3, 'c3000000-0000-0000-0000-000000000003'::uuid), (4, 'c3000000-0000-0000-0000-000000000004'::uuid),
    (5, 'c3000000-0000-0000-0000-000000000005'::uuid), (6, 'c3000000-0000-0000-0000-000000000006'::uuid),
    (7, 'c3000000-0000-0000-0000-000000000007'::uuid), (8, 'c3000000-0000-0000-0000-000000000008'::uuid)
) as subject_data(ordinal, id) on subject_data.ordinal = teacher_data.ordinal
on conflict do nothing;

insert into public.timetable_entries (id, academic_year_id, section_id, teacher_assignment_id, teacher_id, day_of_week, start_time, end_time, room)
select
  ('d3000000-0000-0000-0000-' || lpad((((section_data.ordinal - 1) * 25) + ((day_data.day_of_week - 1) * 5) + period_data.period + 1)::text, 12, '0'))::uuid,
  'b1000000-0000-0000-0000-000000000001', section_data.id, assignment_data.id, assignment_data.teacher_id,
  day_data.day_of_week, time '08:00' + (period_data.period * interval '50 minutes'), time '08:45' + (period_data.period * interval '50 minutes'),
  section_data.room
from (
  values
    (1, 'c2000000-0000-0000-0000-000000000001'::uuid, 'Room 7A'), (2, 'c2000000-0000-0000-0000-000000000002'::uuid, 'Room 7B'),
    (3, 'c2000000-0000-0000-0000-000000000003'::uuid, 'Room 8A'), (4, 'c2000000-0000-0000-0000-000000000004'::uuid, 'Room 8B'),
    (5, 'c2000000-0000-0000-0000-000000000005'::uuid, 'Room 9A'), (6, 'c2000000-0000-0000-0000-000000000006'::uuid, 'Room 9B')
) as section_data(ordinal, id, room)
cross join (select generate_series(1, 5) as day_of_week) day_data
cross join (select generate_series(0, 4) as period) period_data
join public.teacher_assignments assignment_data on assignment_data.section_id = section_data.id
  and assignment_data.academic_year_id = 'b1000000-0000-0000-0000-000000000001'
  and assignment_data.subject_id = ('c3000000-0000-0000-0000-' || lpad((((section_data.ordinal - 1 + day_data.day_of_week - 1 + period_data.period) % 8) + 1)::text, 12, '0'))::uuid
on conflict do nothing;

insert into public.attendance_records (student_id, section_id, academic_year_id, attendance_date, status, remarks, marked_by)
select
  enrollment.student_id, enrollment.section_id, enrollment.academic_year_id, attendance_dates.attendance_date,
  case
    when (right(student_record.admission_number, 3)::integer + attendance_dates.ordinal) % 23 = 0 then 'absent'::public.attendance_status
    when (right(student_record.admission_number, 3)::integer + attendance_dates.ordinal) % 17 = 0 then 'late'::public.attendance_status
    when (right(student_record.admission_number, 3)::integer + attendance_dates.ordinal) % 29 = 0 then 'excused'::public.attendance_status
    else 'present'::public.attendance_status
  end,
  case when (right(student_record.admission_number, 3)::integer + attendance_dates.ordinal) % 23 = 0 then 'Family leave reported by guardian' when (right(student_record.admission_number, 3)::integer + attendance_dates.ordinal) % 17 = 0 then 'Arrived after morning assembly' else null end,
  'a1000000-0000-0000-0000-000000000002'
from public.student_enrollments enrollment
join public.students student_record on student_record.id = enrollment.student_id
cross join unnest(array[date '2026-07-19', date '2026-07-20', date '2026-07-21', date '2026-07-22', date '2026-07-23', date '2026-07-25', date '2026-07-26', date '2026-07-27', date '2026-07-28', date '2026-07-29', date '2026-08-02', date '2026-08-03']) with ordinality as attendance_dates(attendance_date, ordinal)
where enrollment.academic_year_id = 'b1000000-0000-0000-0000-000000000001' and enrollment.status = 'active'
on conflict (student_id, section_id, academic_year_id, attendance_date) do update set
  status = excluded.status, remarks = excluded.remarks, marked_by = excluded.marked_by, updated_at = timezone('utc', now());

insert into public.exams (id, term_id, name, starts_on, ends_on, status)
values
  ('b3000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001', 'First Term Mid-Year Assessment', '2026-07-12', '2026-07-23', 'open'),
  ('b3000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000001', 'First Term Final Examination', '2026-08-16', '2026-08-27', 'draft')
on conflict (id) do nothing;

insert into public.exam_subjects (id, exam_id, section_id, subject_id, maximum_marks, passing_marks, exam_date)
select
  ('b4000000-0000-0000-0000-' || lpad((((exam_data.ordinal - 1) * 48) + ((section_data.ordinal - 1) * 8) + subject_data.ordinal)::text, 12, '0'))::uuid,
  exam_data.id, section_data.id, subject_data.id, 100, 40, exam_data.starts_on + (subject_data.ordinal - 1)
from (
  values
    (1, 'b3000000-0000-0000-0000-000000000001'::uuid, date '2026-07-12'),
    (2, 'b3000000-0000-0000-0000-000000000002'::uuid, date '2026-08-16')
) as exam_data(ordinal, id, starts_on)
cross join (
  select ordinal, ('c2000000-0000-0000-0000-' || lpad(ordinal::text, 12, '0'))::uuid as id
  from generate_series(1, 6) as series(ordinal)
) section_data
cross join (
  select ordinal, ('c3000000-0000-0000-0000-' || lpad(ordinal::text, 12, '0'))::uuid as id
  from generate_series(1, 8) as series(ordinal)
) subject_data
on conflict do nothing;

insert into public.grade_entries (exam_subject_id, student_id, marks, status, remarks, marked_by)
select
  exam_subject.id, enrollment.student_id,
  case when (right(student_record.admission_number, 3)::integer + subject_ordinal) % 47 = 0 or (right(student_record.admission_number, 3)::integer + subject_ordinal) % 53 = 0 then null else (58 + ((right(student_record.admission_number, 3)::integer * 7 + subject_ordinal * 5) % 40))::numeric end,
  case when (right(student_record.admission_number, 3)::integer + subject_ordinal) % 47 = 0 then 'absent'::public.grade_entry_status when (right(student_record.admission_number, 3)::integer + subject_ordinal) % 53 = 0 then 'exempt'::public.grade_entry_status else 'graded'::public.grade_entry_status end,
  case when (right(student_record.admission_number, 3)::integer + subject_ordinal) % 47 = 0 then 'Absent with guardian notice' when (right(student_record.admission_number, 3)::integer + subject_ordinal) % 53 = 0 then 'Approved exemption' else null end,
  teacher_profile.id
from public.exam_subjects exam_subject
join public.teacher_assignments assignment_data on assignment_data.section_id = exam_subject.section_id and assignment_data.subject_id = exam_subject.subject_id and assignment_data.academic_year_id = 'b1000000-0000-0000-0000-000000000001'
join public.teachers teacher_record on teacher_record.id = assignment_data.teacher_id
join public.profiles teacher_profile on teacher_profile.id = teacher_record.profile_id
join public.student_enrollments enrollment on enrollment.section_id = exam_subject.section_id and enrollment.academic_year_id = 'b1000000-0000-0000-0000-000000000001' and enrollment.status = 'active'
join public.students student_record on student_record.id = enrollment.student_id
cross join lateral (select right(exam_subject.subject_id::text, 12)::integer as subject_ordinal) subject_data
where exam_subject.exam_id = 'b3000000-0000-0000-0000-000000000001'
  and not exists (
    select 1 from public.grade_entries existing_grade
    where existing_grade.exam_subject_id = exam_subject.id and existing_grade.student_id = enrollment.student_id
  )
on conflict do nothing;

-- Publish only after every seeded mid-year grade has been inserted. The final
-- examination remains a draft so grade-entry and publication states are both visible.
update public.exams set status = 'published', updated_at = timezone('utc', now())
where id = 'b3000000-0000-0000-0000-000000000001' and status in ('draft', 'open');

insert into public.fee_types (id, name, description, frequency, academic_year_id, default_amount, is_active)
values
  ('c4000000-0000-0000-0000-000000000001', 'Registration Fee', 'Annual registration and student record administration.', 'annual', 'b1000000-0000-0000-0000-000000000001', 4500, true),
  ('c4000000-0000-0000-0000-000000000002', 'First Term Tuition', 'First-term classroom instruction contribution.', 'termly', 'b1000000-0000-0000-0000-000000000001', 5500, true),
  ('c4000000-0000-0000-0000-000000000003', 'Examination Fee', 'Assessment materials and examination administration.', 'termly', 'b1000000-0000-0000-0000-000000000001', 600, true),
  ('c4000000-0000-0000-0000-000000000004', 'Stationery Contribution', 'Optional classroom stationery and activity materials.', 'one_time', 'b1000000-0000-0000-0000-000000000001', 900, true)
on conflict (id) do update set
  name = excluded.name, description = excluded.description, frequency = excluded.frequency,
  academic_year_id = excluded.academic_year_id, default_amount = excluded.default_amount, is_active = excluded.is_active;

insert into public.fee_records (id, student_id, fee_type_id, academic_year_id, term_id, amount_due, due_date, status, notes, created_by)
select
  ('c5000000-0000-0000-0000-' || lpad((((right(student_record.admission_number, 3)::integer - 1) * 4) + fee_type.ordinal)::text, 12, '0'))::uuid,
  student_record.id, fee_type.id, 'b1000000-0000-0000-0000-000000000001',
  case when fee_type.ordinal in (2, 3) then 'b2000000-0000-0000-0000-000000000001'::uuid else null end,
  fee_type.amount_due, fee_type.due_date,
  case when fee_type.due_date < current_date then 'overdue'::public.fee_record_status else 'unpaid'::public.fee_record_status end,
  fee_type.notes, 'a1000000-0000-0000-0000-000000000001'
from public.students student_record
cross join (
  values
    (1, 'c4000000-0000-0000-0000-000000000001'::uuid, 4500::numeric, date '2026-04-15', 'Annual registration record'),
    (2, 'c4000000-0000-0000-0000-000000000002'::uuid, 5500::numeric, date '2026-07-10', 'First term tuition record'),
    (3, 'c4000000-0000-0000-0000-000000000003'::uuid, 600::numeric, date '2026-07-05', 'First term examination record'),
    (4, 'c4000000-0000-0000-0000-000000000004'::uuid, 900::numeric, date '2026-08-15', 'Optional stationery contribution')
) as fee_type(ordinal, id, amount_due, due_date, notes)
where student_record.admission_number like 'JMS-2026-%'
on conflict do nothing;

insert into public.fee_payments (id, fee_record_id, receipt_number, amount, paid_on, payment_method, recorded_by, notes)
select
  ('c6000000-0000-0000-0000-' || lpad((1000 + right(student_record.admission_number, 3)::integer)::text, 12, '0'))::uuid,
  fee_record.id, 'JMS-REC-REG-' || right(student_record.admission_number, 3), 4500, date '2026-04-10', 'cash', 'a1000000-0000-0000-0000-000000000001', 'Registration payment recorded at the school office'
from public.fee_records fee_record
join public.students student_record on student_record.id = fee_record.student_id
where fee_record.fee_type_id = 'c4000000-0000-0000-0000-000000000001'
on conflict do nothing;

insert into public.fee_payments (id, fee_record_id, receipt_number, amount, paid_on, payment_method, recorded_by, notes)
select
  ('c6000000-0000-0000-0000-' || lpad((2000 + right(student_record.admission_number, 3)::integer)::text, 12, '0'))::uuid,
  fee_record.id, 'JMS-REC-T1-' || right(student_record.admission_number, 3),
  case when right(student_record.admission_number, 3)::integer % 2 = 0 then 5500 else 3000 end,
  date '2026-07-08', case when right(student_record.admission_number, 3)::integer % 2 = 0 then 'bank transfer' else 'cash' end,
  'a1000000-0000-0000-0000-000000000001', 'First term payment entry'
from public.fee_records fee_record
join public.students student_record on student_record.id = fee_record.student_id
where fee_record.fee_type_id = 'c4000000-0000-0000-0000-000000000002'
  and right(student_record.admission_number, 3)::integer % 3 <> 0
on conflict do nothing;

insert into public.fee_payments (id, fee_record_id, receipt_number, amount, paid_on, payment_method, recorded_by, notes)
select
  ('c6000000-0000-0000-0000-' || lpad((3000 + right(student_record.admission_number, 3)::integer)::text, 12, '0'))::uuid,
  fee_record.id, 'JMS-REC-EXM-' || right(student_record.admission_number, 3), 600, date '2026-07-06', 'cash', 'a1000000-0000-0000-0000-000000000001', 'Examination fee received'
from public.fee_records fee_record
join public.students student_record on student_record.id = fee_record.student_id
where fee_record.fee_type_id = 'c4000000-0000-0000-0000-000000000003'
  and right(student_record.admission_number, 3)::integer % 4 <> 0
on conflict do nothing;

insert into public.announcements (id, author_id, title, body, status, audience_scope, published_at, expires_at)
values
  ('a2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Welcome to the 2026-2027 academic year', 'Welcome students, parents, and staff. Please keep attendance regular, review the weekly timetable, and contact the school office for record corrections.', 'published', 'all', timezone('utc', now()) - interval '14 days', null),
  ('a2000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'First term assessment results are available', 'The mid-year assessment has been published. Students and linked parents may review the result and report card in the portal.', 'published', 'targeted', timezone('utc', now()) - interval '3 days', null),
  ('a2000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'Grade 7A mathematics practice', 'Grade 7A learners should bring their mathematics exercise book on Monday for the algebra revision activity.', 'published', 'targeted', timezone('utc', now()) - interval '1 day', timezone('utc', now()) + interval '14 days'),
  ('a2000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Parent meeting preparation', 'Draft notice for the upcoming parent meeting. Confirm the final date before publishing.', 'draft', 'targeted', null, null)
on conflict (id) do update set
  author_id = excluded.author_id, title = excluded.title, body = excluded.body, status = excluded.status,
  audience_scope = excluded.audience_scope, published_at = excluded.published_at, expires_at = excluded.expires_at;

insert into public.announcement_role_audiences (announcement_id, role)
values
  ('a2000000-0000-0000-0000-000000000002', 'student'),
  ('a2000000-0000-0000-0000-000000000002', 'parent'),
  ('a2000000-0000-0000-0000-000000000004', 'parent')
on conflict do nothing;

insert into public.announcement_class_audiences (announcement_id, class_id)
values ('a2000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000003')
on conflict do nothing;

insert into public.announcement_section_audiences (announcement_id, section_id)
values ('a2000000-0000-0000-0000-000000000003', 'c2000000-0000-0000-0000-000000000001')
on conflict do nothing;

insert into public.announcement_academic_year_audiences (announcement_id, academic_year_id)
values ('a2000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001')
on conflict do nothing;

-- Quick confirmation output for the Supabase SQL editor.
select
  (select count(*) from public.students where admission_number like 'JMS-2026-%') as seeded_students,
  (select count(*) from public.teachers where employee_number like 'JMS-T-%') as seeded_teachers,
  (select count(*) from public.student_enrollments where academic_year_id = 'b1000000-0000-0000-0000-000000000001' and status = 'active') as active_enrollments,
  (select count(*) from public.attendance_records where academic_year_id = 'b1000000-0000-0000-0000-000000000001') as attendance_records,
  (select count(*) from public.grade_entries ge join public.exam_subjects es on es.id = ge.exam_subject_id where es.exam_id = 'b3000000-0000-0000-0000-000000000001') as mid_year_grade_entries,
  (select count(*) from public.fee_records where academic_year_id = 'b1000000-0000-0000-0000-000000000001') as fee_records,
  (select count(*) from public.announcements where id::text like 'a2000000-%') as announcements;

commit;
