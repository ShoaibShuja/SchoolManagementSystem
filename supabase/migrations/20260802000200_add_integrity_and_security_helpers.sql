create schema if not exists private;

create or replace function private.current_role()
returns public.app_role
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select p.role from public.profiles p where p.id = (select auth.uid())
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select coalesce((select private.current_role()) = 'admin', false)
$$;

create or replace function private.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select coalesce((select private.current_role()) = 'teacher', false)
$$;

create or replace function private.has_teacher_assignment(
  requested_section_id uuid,
  requested_subject_id uuid default null,
  requested_academic_year_id uuid default null
)
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select exists (
    select 1
    from public.teachers t
    join public.teacher_assignments ta on ta.teacher_id = t.id
    where t.profile_id = (select auth.uid())
      and ta.section_id = requested_section_id
      and (requested_subject_id is null or ta.subject_id = requested_subject_id)
      and (requested_academic_year_id is null or ta.academic_year_id = requested_academic_year_id)
  )
$$;

create or replace function private.can_access_student(requested_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select
    (select private.is_admin())
    or exists (
      select 1 from public.students s
      where s.id = requested_student_id and s.profile_id = (select auth.uid())
    )
    or exists (
      select 1
      from public.parents p
      join public.parent_student_links psl on psl.parent_id = p.id
      where p.profile_id = (select auth.uid()) and psl.student_id = requested_student_id
    )
    or (
      (select private.is_teacher())
      and exists (
        select 1
        from public.student_enrollments se
        join public.teachers t on t.profile_id = (select auth.uid())
        join public.teacher_assignments ta on ta.teacher_id = t.id
          and ta.section_id = se.section_id
          and ta.academic_year_id = se.academic_year_id
        where se.student_id = requested_student_id and se.status = 'active'
      )
    )
$$;

create or replace function private.can_view_section(requested_section_id uuid, requested_academic_year_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select
    (select private.is_admin())
    or (select private.has_teacher_assignment(requested_section_id, null, requested_academic_year_id))
    or exists (
      select 1
      from public.student_enrollments se
      join public.students s on s.id = se.student_id
      where se.section_id = requested_section_id
        and se.academic_year_id = requested_academic_year_id
        and se.status = 'active'
        and s.profile_id = (select auth.uid())
    )
    or exists (
      select 1
      from public.student_enrollments se
      join public.parent_student_links psl on psl.student_id = se.student_id
      join public.parents p on p.id = psl.parent_id
      where se.section_id = requested_section_id
        and se.academic_year_id = requested_academic_year_id
        and se.status = 'active'
        and p.profile_id = (select auth.uid())
    )
$$;

create or replace function private.can_view_section_any_year(requested_section_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select
    (select private.is_admin())
    or exists (
      select 1 from public.teacher_assignments ta
      join public.teachers t on t.id = ta.teacher_id
      where ta.section_id = requested_section_id and t.profile_id = (select auth.uid())
    )
    or exists (
      select 1 from public.student_enrollments se
      join public.students s on s.id = se.student_id
      where se.section_id = requested_section_id and se.status = 'active' and s.profile_id = (select auth.uid())
    )
    or exists (
      select 1 from public.student_enrollments se
      join public.parent_student_links psl on psl.student_id = se.student_id
      join public.parents p on p.id = psl.parent_id
      where se.section_id = requested_section_id and se.status = 'active' and p.profile_id = (select auth.uid())
    )
$$;

create or replace function private.can_view_subject(requested_subject_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select
    (select private.is_admin())
    or exists (
      select 1 from public.teacher_assignments ta
      join public.teachers t on t.id = ta.teacher_id
      where ta.subject_id = requested_subject_id and t.profile_id = (select auth.uid())
    )
    or exists (
      select 1
      from public.teacher_assignments ta
      join public.student_enrollments se on se.section_id = ta.section_id and se.academic_year_id = ta.academic_year_id and se.status = 'active'
      join public.students s on s.id = se.student_id
      where ta.subject_id = requested_subject_id and s.profile_id = (select auth.uid())
    )
    or exists (
      select 1
      from public.teacher_assignments ta
      join public.student_enrollments se on se.section_id = ta.section_id and se.academic_year_id = ta.academic_year_id and se.status = 'active'
      join public.parent_student_links psl on psl.student_id = se.student_id
      join public.parents p on p.id = psl.parent_id
      where ta.subject_id = requested_subject_id and p.profile_id = (select auth.uid())
    )
$$;

create or replace function private.can_access_fee(requested_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select
    (select private.is_admin())
    or exists (select 1 from public.students s where s.id = requested_student_id and s.profile_id = (select auth.uid()))
    or exists (
      select 1 from public.parents p
      join public.parent_student_links psl on psl.parent_id = p.id
      where p.profile_id = (select auth.uid()) and psl.student_id = requested_student_id
    )
$$;

create or replace function private.can_view_attendance(
  requested_student_id uuid,
  requested_section_id uuid,
  requested_academic_year_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select
    (select private.can_access_student(requested_student_id))
    or (select private.has_teacher_assignment(requested_section_id, null, requested_academic_year_id))
$$;

create or replace function private.can_manage_grade(requested_exam_subject_id uuid, requested_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select
    (select private.is_admin())
    or exists (
      select 1
      from public.exam_subjects es
      join public.exams e on e.id = es.exam_id
      join public.terms term on term.id = e.term_id
      join public.teachers t on t.profile_id = (select auth.uid())
      join public.teacher_assignments ta on ta.teacher_id = t.id
        and ta.section_id = es.section_id
        and ta.subject_id = es.subject_id
        and ta.academic_year_id = term.academic_year_id
      join public.student_enrollments se on se.student_id = requested_student_id
        and se.section_id = es.section_id
        and se.academic_year_id = term.academic_year_id
      where es.id = requested_exam_subject_id
        and se.status in ('active', 'completed', 'transferred')
    )
$$;

create or replace function private.can_view_grade(requested_exam_subject_id uuid, requested_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select
    (select private.can_manage_grade(requested_exam_subject_id, requested_student_id))
    or (
      (select private.can_access_student(requested_student_id))
      and exists (
        select 1
        from public.exam_subjects es
        join public.exams e on e.id = es.exam_id
        where es.id = requested_exam_subject_id and e.status = 'published'
      )
    )
$$;

create or replace function private.can_view_exam(requested_exam_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select
    (select private.is_admin())
    or exists (
      select 1
      from public.exam_subjects es
      join public.exams e on e.id = es.exam_id
      join public.terms term on term.id = e.term_id
      where es.exam_id = requested_exam_id
        and (select private.can_view_section(es.section_id, term.academic_year_id))
    )
$$;

create or replace function private.can_manage_announcement(requested_announcement_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select
    (select private.is_admin())
    or exists (
      select 1 from public.announcements a
      where a.id = requested_announcement_id
        and a.author_id = (select auth.uid())
        and (select private.is_teacher())
    )
$$;

create or replace function private.can_view_announcement(requested_announcement_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select
    (select private.can_manage_announcement(requested_announcement_id))
    or exists (
      select 1
      from public.announcements a
      where a.id = requested_announcement_id
        and a.status = 'published'
        and a.published_at <= timezone('utc', now())
        and (a.expires_at is null or a.expires_at > timezone('utc', now()))
        and (
          a.audience_scope = 'all'
          or exists (
            select 1 from public.announcement_role_audiences ara
            where ara.announcement_id = a.id and ara.role = (select private.current_role())
          )
          or exists (
            select 1
            from public.announcement_section_audiences asa
            join public.student_enrollments se on se.section_id = asa.section_id and se.status = 'active'
            left join public.students s on s.id = se.student_id
            left join public.parent_student_links psl on psl.student_id = se.student_id
            left join public.parents p on p.id = psl.parent_id
            left join public.teachers t on t.profile_id = (select auth.uid())
            left join public.teacher_assignments ta on ta.teacher_id = t.id and ta.section_id = asa.section_id and ta.academic_year_id = se.academic_year_id
            where asa.announcement_id = a.id
              and (s.profile_id = (select auth.uid()) or p.profile_id = (select auth.uid()) or ta.id is not null)
          )
          or exists (
            select 1
            from public.announcement_class_audiences aca
            join public.sections section_record on section_record.class_id = aca.class_id
            join public.student_enrollments se on se.section_id = section_record.id and se.status = 'active'
            left join public.students s on s.id = se.student_id
            left join public.parent_student_links psl on psl.student_id = se.student_id
            left join public.parents p on p.id = psl.parent_id
            left join public.teachers t on t.profile_id = (select auth.uid())
            left join public.teacher_assignments ta on ta.teacher_id = t.id and ta.section_id = section_record.id and ta.academic_year_id = se.academic_year_id
            where aca.announcement_id = a.id
              and (s.profile_id = (select auth.uid()) or p.profile_id = (select auth.uid()) or ta.id is not null)
          )
        )
    )
$$;

create or replace function private.validate_term_dates()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  academic_year public.academic_years;
begin
  select * into academic_year from public.academic_years where id = new.academic_year_id;
  if new.starts_on < academic_year.starts_on or new.ends_on > academic_year.ends_on then
    raise exception 'Term dates must fall within the academic year';
  end if;
  return new;
end;
$$;

create or replace function private.validate_enrollment_dates()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  academic_year public.academic_years;
begin
  select * into academic_year from public.academic_years where id = new.academic_year_id;
  if new.enrolled_on < academic_year.starts_on or new.enrolled_on > academic_year.ends_on then
    raise exception 'Enrollment date must fall within the academic year';
  end if;
  if new.ended_on is not null and (new.ended_on < academic_year.starts_on or new.ended_on > academic_year.ends_on) then
    raise exception 'Enrollment end date must fall within the academic year';
  end if;
  return new;
end;
$$;

create or replace function private.validate_timetable_entry()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  assignment_record public.teacher_assignments;
begin
  select * into assignment_record from public.teacher_assignments where id = new.teacher_assignment_id;
  if assignment_record.teacher_id <> new.teacher_id
    or assignment_record.section_id <> new.section_id
    or assignment_record.academic_year_id <> new.academic_year_id then
    raise exception 'Timetable entry must match its teacher assignment';
  end if;
  return new;
end;
$$;

create or replace function private.validate_attendance_record()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
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

create or replace function private.validate_grade_entry()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  exam_subject_record public.exam_subjects;
  academic_year_id uuid;
begin
  select es.* into exam_subject_record from public.exam_subjects es where es.id = new.exam_subject_id;
  if new.status = 'graded' and new.marks > exam_subject_record.maximum_marks then
    raise exception 'Grade marks cannot exceed maximum marks';
  end if;
  select term.academic_year_id into academic_year_id
  from public.exams exam join public.terms term on term.id = exam.term_id
  where exam.id = exam_subject_record.exam_id;
  if not exists (
    select 1 from public.student_enrollments se
    where se.student_id = new.student_id
      and se.section_id = exam_subject_record.section_id
      and se.academic_year_id = academic_year_id
      and se.status in ('active', 'completed', 'transferred')
  ) then
    raise exception 'Grade entry requires a student enrollment in the exam section';
  end if;
  return new;
end;
$$;

create or replace function private.validate_fee_payment()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  amount_due numeric(12, 2);
  paid_total numeric(12, 2);
begin
  select fr.amount_due into amount_due from public.fee_records fr where fr.id = new.fee_record_id;
  select coalesce(sum(fp.amount), 0) into paid_total
  from public.fee_payments fp
  where fp.fee_record_id = new.fee_record_id and fp.id is distinct from new.id;
  if paid_total + new.amount > amount_due then
    raise exception 'Fee payments cannot exceed the amount due';
  end if;
  return new;
end;
$$;

create trigger validate_term_dates before insert or update on public.terms for each row execute function private.validate_term_dates();
create trigger validate_enrollment_dates before insert or update on public.student_enrollments for each row execute function private.validate_enrollment_dates();
create trigger validate_timetable_entry before insert or update on public.timetable_entries for each row execute function private.validate_timetable_entry();
create trigger validate_attendance_record before insert or update on public.attendance_records for each row execute function private.validate_attendance_record();
create trigger validate_grade_entry before insert or update on public.grade_entries for each row execute function private.validate_grade_entry();
create trigger validate_fee_payment before insert or update on public.fee_payments for each row execute function private.validate_fee_payment();

revoke all on schema private from public;
revoke all on all functions in schema private from public;
grant usage on schema private to authenticated;
grant execute on all functions in schema private to authenticated;
