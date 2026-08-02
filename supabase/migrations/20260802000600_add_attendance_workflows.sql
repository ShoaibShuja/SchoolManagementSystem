-- Attendance dates must be part of the selected academic year as well as a
-- valid active enrollment. This closes the gap left by record-level checks.
create or replace function private.validate_attendance_record()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  academic_year public.academic_years;
begin
  select * into academic_year from public.academic_years where id = new.academic_year_id;
  if new.attendance_date < academic_year.starts_on or new.attendance_date > academic_year.ends_on then
    raise exception 'Attendance date must fall within the academic year';
  end if;
  if not exists (
    select 1 from public.student_enrollments se
    where se.student_id = new.student_id
      and se.section_id = new.section_id
      and se.academic_year_id = new.academic_year_id
      and se.status in ('active', 'completed', 'transferred')
      and se.enrolled_on <= new.attendance_date
      and (se.ended_on is null or se.ended_on >= new.attendance_date)
  ) then
    raise exception 'Attendance record requires a valid enrollment on the attendance date';
  end if;
  return new;
end;
$$;

-- One statement makes a day’s roster save atomic and turns duplicate rows into
-- corrections. It remains subject to RLS because it is security invoker.
create or replace function public.save_section_attendance(
  requested_section_id uuid,
  requested_academic_year_id uuid,
  requested_date date,
  requested_records jsonb
)
returns integer
language plpgsql
security invoker
set search_path = public, auth, pg_temp
as $$
declare
  saved_count integer;
begin
  if requested_date is null then
    raise exception 'Attendance date is required';
  end if;
  if not ((select private.is_admin()) or (select private.has_teacher_assignment(requested_section_id, null, requested_academic_year_id))) then
    raise exception 'You are not assigned to this section';
  end if;
  if jsonb_typeof(requested_records) <> 'array' or jsonb_array_length(requested_records) = 0 then
    raise exception 'At least one attendance record is required';
  end if;
  if exists (
    select 1
    from jsonb_to_recordset(requested_records) as r(student_id uuid, status public.attendance_status, remarks text)
    group by r.student_id
    having count(*) > 1
  ) then
    raise exception 'A student may only appear once in an attendance save';
  end if;
  if exists (
    select 1
    from jsonb_to_recordset(requested_records) as r(student_id uuid, status public.attendance_status, remarks text)
    where not exists (
      select 1 from public.student_enrollments se
      where se.student_id = r.student_id and se.section_id = requested_section_id
        and se.academic_year_id = requested_academic_year_id and se.status = 'active'
        and se.enrolled_on <= requested_date and (se.ended_on is null or se.ended_on >= requested_date)
    )
  ) then
    raise exception 'Attendance contains a student outside the active section roster';
  end if;
  insert into public.attendance_records (student_id, section_id, academic_year_id, attendance_date, status, remarks, marked_by)
  select r.student_id, requested_section_id, requested_academic_year_id, requested_date, r.status, nullif(trim(r.remarks), ''), auth.uid()
  from jsonb_to_recordset(requested_records) as r(student_id uuid, status public.attendance_status, remarks text)
  on conflict (student_id, section_id, academic_year_id, attendance_date)
  do update set status = excluded.status, remarks = excluded.remarks, marked_by = excluded.marked_by, updated_at = timezone('utc', now());
  get diagnostics saved_count = row_count;
  return saved_count;
end;
$$;

grant execute on function public.save_section_attendance(uuid, uuid, date, jsonb) to authenticated;
