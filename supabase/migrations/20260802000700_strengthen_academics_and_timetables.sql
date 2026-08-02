-- Academic structure and timetable safeguards. The original schema already
-- contains these core tables; this migration adds the rules needed for daily use.

alter table public.subjects add column if not exists description text;
alter table public.subjects add constraint subjects_description_length_check
  check (description is null or char_length(trim(description)) <= 1000);

-- A retired code can be reused, but two currently taught subjects cannot share it.
alter table public.subjects drop constraint if exists subjects_code_key;
create unique index if not exists subjects_active_code_unique_idx
  on public.subjects (code) where is_active;

-- Terms are inclusive school-calendar periods and must not overlap within a year.
alter table public.terms add constraint terms_no_overlap
  exclude using gist (
    academic_year_id with =,
    daterange(starts_on, ends_on, '[]') with &&
  );

create or replace function private.validate_academic_year_dates()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if exists (
    select 1 from public.terms t
    where t.academic_year_id = new.id
      and (t.starts_on < new.starts_on or t.ends_on > new.ends_on)
  ) then
    raise exception 'Academic year dates cannot exclude an existing term';
  end if;
  if exists (
    select 1 from public.student_enrollments se
    where se.academic_year_id = new.id
      and (se.enrolled_on < new.starts_on or se.enrolled_on > new.ends_on
        or (se.ended_on is not null and (se.ended_on < new.starts_on or se.ended_on > new.ends_on)))
  ) then
    raise exception 'Academic year dates cannot exclude an existing enrollment';
  end if;
  return new;
end;
$$;

create trigger validate_academic_year_dates
before update of starts_on, ends_on on public.academic_years
for each row execute function private.validate_academic_year_dates();

create or replace function private.validate_timetable_entry()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  assignment_record public.teacher_assignments;
begin
  select * into assignment_record from public.teacher_assignments where id = new.teacher_assignment_id;
  if not found then
    raise exception 'Choose a valid teacher assignment';
  end if;
  if assignment_record.teacher_id <> new.teacher_id
    or assignment_record.section_id <> new.section_id
    or assignment_record.academic_year_id <> new.academic_year_id then
    raise exception 'Timetable entry must match its teacher assignment';
  end if;

  new.room := nullif(trim(new.room), '');

  if exists (
    select 1 from public.timetable_entries te
    where te.id is distinct from new.id
      and te.academic_year_id = new.academic_year_id
      and te.day_of_week = new.day_of_week
      and te.section_id = new.section_id
      and te.start_time < new.end_time and new.start_time < te.end_time
  ) then
    raise exception 'This section already has a lesson during that time';
  end if;
  if exists (
    select 1 from public.timetable_entries te
    where te.id is distinct from new.id
      and te.academic_year_id = new.academic_year_id
      and te.day_of_week = new.day_of_week
      and te.teacher_id = new.teacher_id
      and te.start_time < new.end_time and new.start_time < te.end_time
  ) then
    raise exception 'This teacher is already scheduled during that time';
  end if;
  if new.room is not null and exists (
    select 1 from public.timetable_entries te
    where te.id is distinct from new.id
      and te.academic_year_id = new.academic_year_id
      and te.day_of_week = new.day_of_week
      and te.room = new.room
      and te.start_time < new.end_time and new.start_time < te.end_time
  ) then
    raise exception 'This room is already scheduled during that time';
  end if;
  return new;
end;
$$;

alter table public.timetable_entries add constraint timetable_room_no_overlap
  exclude using gist (
    academic_year_id with =,
    room with =,
    day_of_week with =,
    int4range((extract(hour from start_time)::int * 60 + extract(minute from start_time)::int), (extract(hour from end_time)::int * 60 + extract(minute from end_time)::int), '[)') with &&
  ) where (room is not null);
