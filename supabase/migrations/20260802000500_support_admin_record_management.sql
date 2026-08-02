-- Allows an administrator to maintain a teacher's school record before an
-- optional Supabase Auth account is provisioned. These fields deliberately
-- live on the school record rather than in profiles, which always requires Auth.
alter table public.teachers
  add column first_name text,
  add column last_name text,
  add column phone text,
  add column email text,
  add column qualification text;

update public.teachers t
set
  first_name = p.first_name,
  last_name = p.last_name,
  phone = p.phone
from public.profiles p
where t.profile_id = p.id;

alter table public.teachers
  alter column first_name set not null,
  alter column last_name set not null,
  add constraint teachers_first_name_length_check check (char_length(trim(first_name)) between 1 and 100),
  add constraint teachers_last_name_length_check check (char_length(trim(last_name)) between 1 and 100),
  add constraint teachers_qualification_length_check check (qualification is null or char_length(trim(qualification)) <= 500);

alter table public.sections
  add column capacity smallint not null default 40 check (capacity > 0 and capacity <= 500);

-- A unique partial index prevents the same active enrollment being created
-- twice while the existing index preserves the one-active-section-per-year rule.
create unique index student_enrollments_active_student_section_year_idx
  on public.student_enrollments (student_id, academic_year_id, section_id)
  where status = 'active';

create or replace function private.validate_section_capacity()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  section_capacity smallint;
  active_students integer;
begin
  if new.status <> 'active' then
    return new;
  end if;

  select capacity into section_capacity from public.sections where id = new.section_id;
  select count(*) into active_students
  from public.student_enrollments
  where section_id = new.section_id
    and academic_year_id = new.academic_year_id
    and status = 'active'
    and id is distinct from new.id;

  if active_students >= section_capacity then
    raise exception 'This section has reached its capacity';
  end if;
  return new;
end;
$$;

create trigger validate_section_capacity
before insert or update of section_id, academic_year_id, status on public.student_enrollments
for each row execute function private.validate_section_capacity();

-- Transferring an enrollment must be atomic: deactivating an existing section
-- before a failed insert would otherwise leave the learner without placement.
create or replace function public.transfer_student_enrollment(
  requested_student_id uuid,
  requested_academic_year_id uuid,
  requested_section_id uuid,
  requested_enrolled_on date
)
returns public.student_enrollments
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  previous_enrollment public.student_enrollments;
  new_enrollment public.student_enrollments;
begin
  if not (select private.is_admin()) then
    raise exception 'Only an administrator can transfer a student enrollment';
  end if;

  select * into previous_enrollment
  from public.student_enrollments
  where student_id = requested_student_id
    and academic_year_id = requested_academic_year_id
    and status = 'active'
  for update;

  if previous_enrollment.id is not null and previous_enrollment.section_id = requested_section_id then
    return previous_enrollment;
  end if;

  if previous_enrollment.id is not null then
    update public.student_enrollments
    set status = 'transferred', ended_on = requested_enrolled_on
    where id = previous_enrollment.id;
  end if;

  insert into public.student_enrollments (student_id, academic_year_id, section_id, enrolled_on, status)
  values (requested_student_id, requested_academic_year_id, requested_section_id, requested_enrolled_on, 'active')
  returning * into new_enrollment;
  return new_enrollment;
end;
$$;

grant execute on function public.transfer_student_enrollment(uuid, uuid, uuid, date) to authenticated;
