-- Examination and result workflows build on the normalized exam tables.

alter type public.exam_status add value if not exists 'open' before 'published';

alter table public.exam_subjects add column if not exists exam_date date;
update public.exam_subjects es set exam_date = e.starts_on from public.exams e where e.id = es.exam_id and es.exam_date is null;
alter table public.exam_subjects alter column exam_date set not null;

create table public.grade_entry_audits (
  id uuid primary key default gen_random_uuid(),
  grade_entry_id uuid not null references public.grade_entries(id) on delete cascade,
  changed_by uuid not null references public.profiles(id) on delete restrict,
  previous_marks numeric(7, 2),
  previous_status public.grade_entry_status,
  previous_remarks text,
  changed_at timestamptz not null default timezone('utc', now())
);

create index grade_entry_audits_grade_entry_idx on public.grade_entry_audits (grade_entry_id, changed_at desc);
alter table public.grade_entry_audits enable row level security;
grant select on public.grade_entry_audits to authenticated;
create policy grade_entry_audits_read_scoped on public.grade_entry_audits
for select to authenticated
using (
  (select private.is_admin()) or exists (
    select 1 from public.grade_entries ge
    where ge.id = grade_entry_audits.grade_entry_id
      and (select private.can_manage_grade(ge.exam_subject_id, ge.student_id))
  )
);

create or replace function private.can_view_exam(requested_exam_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select
    (select private.is_admin())
    or (
      (select private.is_teacher()) and exists (
        select 1
        from public.exam_subjects es
        join public.exams e on e.id = es.exam_id
        join public.terms term on term.id = e.term_id
        where e.id = requested_exam_id
          and (select private.has_teacher_assignment(es.section_id, es.subject_id, term.academic_year_id))
      )
    )
    or exists (
      select 1
      from public.exam_subjects es
      join public.exams e on e.id = es.exam_id
      join public.terms term on term.id = e.term_id
      where e.id = requested_exam_id and e.status = 'published'
        and (select private.can_view_section(es.section_id, term.academic_year_id))
    )
$$;

drop policy if exists exam_subjects_read_scoped on public.exam_subjects;
create policy exam_subjects_read_scoped on public.exam_subjects
for select to authenticated
using ((select private.can_view_exam(exam_id)));

create or replace function private.validate_exam_subject()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  term_record public.terms;
begin
  select t.* into term_record from public.exams e join public.terms t on t.id = e.term_id where e.id = new.exam_id;
  if new.exam_date < term_record.starts_on or new.exam_date > term_record.ends_on then
    raise exception 'Exam date must fall within the selected term';
  end if;
  return new;
end;
$$;

create trigger validate_exam_subject
before insert or update on public.exam_subjects
for each row execute function private.validate_exam_subject();

create or replace function private.lock_published_grade_entries()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if exists (
    select 1 from public.exam_subjects es join public.exams e on e.id = es.exam_id
    where es.id = coalesce(new.exam_subject_id, old.exam_subject_id) and e.status = 'published'
  ) then
    raise exception 'Published results are locked and cannot be changed';
  end if;
  return coalesce(new, old);
end;
$$;

create trigger lock_published_grade_entries
before insert or update or delete on public.grade_entries
for each row execute function private.lock_published_grade_entries();

create or replace function private.audit_grade_entry_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'UPDATE' and (old.marks is distinct from new.marks or old.status is distinct from new.status or old.remarks is distinct from new.remarks) then
    insert into public.grade_entry_audits (grade_entry_id, changed_by, previous_marks, previous_status, previous_remarks)
    values (new.id, (select auth.uid()), old.marks, old.status, old.remarks);
  end if;
  return new;
end;
$$;

create trigger audit_grade_entry_change
after update on public.grade_entries
for each row execute function private.audit_grade_entry_change();

create or replace function public.save_exam_grades(requested_exam_subject_id uuid, requested_records jsonb)
returns integer
language plpgsql
security invoker
set search_path = public, auth, pg_temp
as $$
declare
  saved_count integer;
begin
  if not exists (
    select 1 from public.exam_subjects es
    join public.exams e on e.id = es.exam_id
    where es.id = requested_exam_subject_id and e.status in ('draft', 'open')
  ) then
    raise exception 'Grades can only be saved while the exam is draft or open';
  end if;
  if jsonb_typeof(requested_records) <> 'array' or jsonb_array_length(requested_records) = 0 then
    raise exception 'At least one grade is required';
  end if;
  if exists (
    select 1 from jsonb_to_recordset(requested_records) as r(student_id uuid, marks numeric, status public.grade_entry_status, remarks text)
    where not (select private.can_manage_grade(requested_exam_subject_id, r.student_id))
  ) then
    raise exception 'You can only enter grades for your assigned subject and section';
  end if;
  if exists (
    select 1 from jsonb_to_recordset(requested_records) as r(student_id uuid, marks numeric, status public.grade_entry_status, remarks text)
    group by r.student_id having count(*) > 1
  ) then
    raise exception 'A student may only appear once in a grade save';
  end if;
  insert into public.grade_entries (exam_subject_id, student_id, marks, status, remarks, marked_by)
  select requested_exam_subject_id, r.student_id, r.marks, r.status, nullif(trim(r.remarks), ''), auth.uid()
  from jsonb_to_recordset(requested_records) as r(student_id uuid, marks numeric, status public.grade_entry_status, remarks text)
  on conflict (exam_subject_id, student_id) do update
    set marks = excluded.marks, status = excluded.status, remarks = excluded.remarks, marked_by = excluded.marked_by, updated_at = timezone('utc', now());
  get diagnostics saved_count = row_count;
  return saved_count;
end;
$$;

create or replace function public.publish_exam(requested_exam_id uuid)
returns void
language plpgsql
security invoker
set search_path = public, auth, pg_temp
as $$
begin
  if not (select private.is_admin()) then
    raise exception 'Only administrators can publish results';
  end if;
  if not exists (select 1 from public.exam_subjects where exam_id = requested_exam_id) then
    raise exception 'Add at least one subject before publishing an exam';
  end if;
  if exists (
    select 1
    from public.exam_subjects es
    join public.exams e on e.id = es.exam_id
    join public.terms t on t.id = e.term_id
    join public.student_enrollments se on se.section_id = es.section_id and se.academic_year_id = t.academic_year_id
      and se.status in ('active', 'completed', 'transferred')
    left join public.grade_entries ge on ge.exam_subject_id = es.id and ge.student_id = se.student_id
    where es.exam_id = requested_exam_id and ge.id is null
  ) then
    raise exception 'Enter a grade, absence, or exemption for every enrolled student before publishing';
  end if;
  update public.exams set status = 'published', updated_at = timezone('utc', now())
  where id = requested_exam_id and status in ('draft', 'open');
  if not found then raise exception 'Only a draft or open exam can be published'; end if;
end;
$$;

grant execute on function public.save_exam_grades(uuid, jsonb) to authenticated;
grant execute on function public.publish_exam(uuid) to authenticated;
