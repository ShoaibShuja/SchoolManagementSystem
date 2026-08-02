create extension if not exists "pgcrypto";
create extension if not exists "btree_gist";

create type public.app_role as enum ('admin', 'teacher', 'student', 'parent');
create type public.profile_status as enum ('active', 'inactive');
create type public.student_status as enum ('active', 'inactive', 'graduated', 'withdrawn');
create type public.teacher_status as enum ('active', 'inactive', 'on_leave', 'terminated');
create type public.academic_year_status as enum ('planned', 'current', 'archived');
create type public.term_status as enum ('planned', 'current', 'closed');
create type public.enrollment_status as enum ('active', 'transferred', 'completed', 'withdrawn');
create type public.attendance_status as enum ('present', 'absent', 'late', 'excused');
create type public.exam_status as enum ('draft', 'published', 'closed');
create type public.grade_entry_status as enum ('graded', 'absent', 'exempt');
create type public.fee_record_status as enum ('unpaid', 'partially_paid', 'paid', 'overdue', 'waived');
create type public.announcement_status as enum ('draft', 'published', 'archived');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null,
  first_name text not null check (char_length(trim(first_name)) between 1 and 100),
  last_name text not null check (char_length(trim(last_name)) between 1 and 100),
  phone text,
  avatar_path text,
  status public.profile_status not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.academic_years (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(trim(name)) between 1 and 100),
  starts_on date not null,
  ends_on date not null,
  status public.academic_year_status not null default 'planned',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (starts_on < ends_on)
);

create unique index academic_years_one_current_idx on public.academic_years (status) where status = 'current';

create table public.terms (
  id uuid primary key default gen_random_uuid(),
  academic_year_id uuid not null references public.academic_years(id) on delete restrict,
  name text not null check (char_length(trim(name)) between 1 and 100),
  starts_on date not null,
  ends_on date not null,
  status public.term_status not null default 'planned',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (academic_year_id, name),
  check (starts_on < ends_on)
);

create unique index terms_one_current_idx on public.terms (academic_year_id) where status = 'current';

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(trim(name)) between 1 and 100),
  display_order smallint not null unique check (display_order > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.sections (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete restrict,
  name text not null check (char_length(trim(name)) between 1 and 50),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (class_id, name)
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = upper(trim(code)) and char_length(code) between 2 and 20),
  name text not null unique check (char_length(trim(name)) between 1 and 100),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.teachers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete set null,
  employee_number text not null unique check (char_length(trim(employee_number)) between 1 and 50),
  employment_started_on date not null,
  employment_ended_on date,
  status public.teacher_status not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (employment_ended_on is null or employment_ended_on >= employment_started_on)
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete set null,
  admission_number text not null unique check (char_length(trim(admission_number)) between 1 and 50),
  first_name text not null check (char_length(trim(first_name)) between 1 and 100),
  last_name text not null check (char_length(trim(last_name)) between 1 and 100),
  date_of_birth date,
  enrolled_on date not null,
  status public.student_status not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.parents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete set null,
  first_name text not null check (char_length(trim(first_name)) between 1 and 100),
  last_name text not null check (char_length(trim(last_name)) between 1 and 100),
  phone text,
  email text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.parent_student_links (
  parent_id uuid not null references public.parents(id) on delete restrict,
  student_id uuid not null references public.students(id) on delete restrict,
  relationship text not null check (char_length(trim(relationship)) between 1 and 50),
  is_primary_contact boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (parent_id, student_id)
);

create unique index parent_student_links_one_primary_contact_idx on public.parent_student_links (student_id) where is_primary_contact;

create table public.teacher_assignments (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete restrict,
  section_id uuid not null references public.sections(id) on delete restrict,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  academic_year_id uuid not null references public.academic_years(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (teacher_id, section_id, subject_id, academic_year_id)
);

create table public.student_enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete restrict,
  academic_year_id uuid not null references public.academic_years(id) on delete restrict,
  section_id uuid not null references public.sections(id) on delete restrict,
  enrolled_on date not null,
  ended_on date,
  status public.enrollment_status not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (ended_on is null or ended_on >= enrolled_on)
);

create unique index student_enrollments_one_active_year_idx on public.student_enrollments (student_id, academic_year_id) where status = 'active';
create unique index student_enrollments_no_duplicate_section_date_idx on public.student_enrollments (student_id, academic_year_id, section_id, enrolled_on);

create table public.timetable_entries (
  id uuid primary key default gen_random_uuid(),
  academic_year_id uuid not null references public.academic_years(id) on delete restrict,
  section_id uuid not null references public.sections(id) on delete restrict,
  teacher_assignment_id uuid not null references public.teacher_assignments(id) on delete restrict,
  teacher_id uuid not null references public.teachers(id) on delete restrict,
  day_of_week smallint not null check (day_of_week between 1 and 7),
  start_time time not null,
  end_time time not null,
  room text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (start_time < end_time)
);

alter table public.timetable_entries add constraint timetable_section_no_overlap
exclude using gist (
  academic_year_id with =,
  section_id with =,
  day_of_week with =,
  int4range((extract(hour from start_time)::int * 60 + extract(minute from start_time)::int), (extract(hour from end_time)::int * 60 + extract(minute from end_time)::int), '[)') with &&
);

alter table public.timetable_entries add constraint timetable_teacher_no_overlap
exclude using gist (
  academic_year_id with =,
  teacher_id with =,
  day_of_week with =,
  int4range((extract(hour from start_time)::int * 60 + extract(minute from start_time)::int), (extract(hour from end_time)::int * 60 + extract(minute from end_time)::int), '[)') with &&
);

create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete restrict,
  section_id uuid not null references public.sections(id) on delete restrict,
  academic_year_id uuid not null references public.academic_years(id) on delete restrict,
  attendance_date date not null,
  status public.attendance_status not null,
  remarks text,
  marked_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (student_id, section_id, academic_year_id, attendance_date)
);

create table public.exams (
  id uuid primary key default gen_random_uuid(),
  term_id uuid not null references public.terms(id) on delete restrict,
  name text not null check (char_length(trim(name)) between 1 and 100),
  starts_on date not null,
  ends_on date not null,
  status public.exam_status not null default 'draft',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (term_id, name),
  check (starts_on <= ends_on)
);

create table public.exam_subjects (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete restrict,
  section_id uuid not null references public.sections(id) on delete restrict,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  maximum_marks numeric(7, 2) not null check (maximum_marks > 0),
  passing_marks numeric(7, 2) not null check (passing_marks >= 0 and passing_marks <= maximum_marks),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (exam_id, section_id, subject_id)
);

create table public.grade_entries (
  id uuid primary key default gen_random_uuid(),
  exam_subject_id uuid not null references public.exam_subjects(id) on delete restrict,
  student_id uuid not null references public.students(id) on delete restrict,
  marks numeric(7, 2),
  status public.grade_entry_status not null default 'graded',
  remarks text,
  marked_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (exam_subject_id, student_id),
  check ((status = 'graded' and marks is not null and marks >= 0) or (status in ('absent', 'exempt') and marks is null))
);

create table public.fee_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(trim(name)) between 1 and 100),
  default_amount numeric(12, 2) not null check (default_amount >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.fee_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete restrict,
  academic_year_id uuid not null references public.academic_years(id) on delete restrict,
  term_id uuid references public.terms(id) on delete restrict,
  fee_type_id uuid not null references public.fee_types(id) on delete restrict,
  amount_due numeric(12, 2) not null check (amount_due >= 0),
  due_date date not null,
  status public.fee_record_status not null default 'unpaid',
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique nulls not distinct (student_id, academic_year_id, term_id, fee_type_id, due_date)
);

create table public.fee_payments (
  id uuid primary key default gen_random_uuid(),
  fee_record_id uuid not null references public.fee_records(id) on delete restrict,
  receipt_number text not null unique check (char_length(trim(receipt_number)) between 1 and 50),
  amount numeric(12, 2) not null check (amount > 0),
  paid_on date not null,
  recorded_by uuid not null references public.profiles(id) on delete restrict,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete restrict,
  title text not null check (char_length(trim(title)) between 1 and 180),
  body text not null check (char_length(trim(body)) between 1 and 10000),
  status public.announcement_status not null default 'draft',
  audience_scope text not null check (audience_scope in ('all', 'targeted')),
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (expires_at is null or published_at is null or expires_at > published_at),
  check ((status = 'published' and published_at is not null) or status <> 'published')
);

create table public.announcement_role_audiences (
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  role public.app_role not null,
  primary key (announcement_id, role)
);

create table public.announcement_class_audiences (
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete restrict,
  primary key (announcement_id, class_id)
);

create table public.announcement_section_audiences (
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  section_id uuid not null references public.sections(id) on delete restrict,
  primary key (announcement_id, section_id)
);

create index terms_academic_year_dates_idx on public.terms (academic_year_id, starts_on, ends_on);
create index sections_class_idx on public.sections (class_id);
create index teachers_profile_idx on public.teachers (profile_id);
create index students_profile_idx on public.students (profile_id);
create index parents_profile_idx on public.parents (profile_id);
create index parent_student_links_student_idx on public.parent_student_links (student_id);
create index teacher_assignments_teacher_scope_idx on public.teacher_assignments (teacher_id, academic_year_id, section_id, subject_id);
create index teacher_assignments_section_scope_idx on public.teacher_assignments (section_id, academic_year_id, subject_id);
create index student_enrollments_student_scope_idx on public.student_enrollments (student_id, academic_year_id, section_id);
create index student_enrollments_section_scope_idx on public.student_enrollments (section_id, academic_year_id, student_id) where status = 'active';
create index timetable_entries_section_idx on public.timetable_entries (section_id, academic_year_id, day_of_week);
create index timetable_entries_teacher_idx on public.timetable_entries (teacher_id, academic_year_id, day_of_week);
create index attendance_records_student_date_idx on public.attendance_records (student_id, attendance_date desc);
create index attendance_records_section_date_idx on public.attendance_records (section_id, academic_year_id, attendance_date desc);
create index exams_term_idx on public.exams (term_id, status);
create index exam_subjects_section_idx on public.exam_subjects (section_id, subject_id);
create index grade_entries_student_idx on public.grade_entries (student_id);
create index fee_records_student_idx on public.fee_records (student_id, due_date);
create index fee_records_status_due_idx on public.fee_records (status, due_date);
create index fee_payments_record_idx on public.fee_payments (fee_record_id, paid_on);
create index announcements_publication_idx on public.announcements (status, published_at desc);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'academic_years', 'terms', 'classes', 'sections', 'subjects', 'teachers', 'students', 'parents',
    'teacher_assignments', 'student_enrollments', 'timetable_entries', 'attendance_records', 'exams', 'exam_subjects',
    'grade_entries', 'fee_types', 'fee_records', 'fee_payments', 'announcements'
  ]
  loop
    execute format('create trigger set_%1$s_updated_at before update on public.%1$I for each row execute function public.set_updated_at()', table_name);
  end loop;
end;
$$;
