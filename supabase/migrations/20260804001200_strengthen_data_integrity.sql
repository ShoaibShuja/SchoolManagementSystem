-- Transactional student creation prevents partial guardian, link, and
-- enrollment records when a later write fails.
create or replace function public.create_student_with_guardian(
  requested_admission_number text, requested_first_name text, requested_last_name text,
  requested_date_of_birth date, requested_enrolled_on date, requested_status public.student_status,
  requested_guardian_first_name text, requested_guardian_last_name text, requested_guardian_phone text,
  requested_guardian_email text, requested_guardian_relationship text,
  requested_academic_year_id uuid, requested_section_id uuid
) returns uuid language plpgsql security invoker set search_path = public, auth, pg_temp as $$
declare student_id uuid; guardian_id uuid;
begin
  if not (select private.is_admin()) then raise exception 'Only administrators can create student records'; end if;
  if (requested_academic_year_id is null) <> (requested_section_id is null) then raise exception 'Choose both an academic year and section'; end if;
  insert into public.students(admission_number, first_name, last_name, date_of_birth, enrolled_on, status)
  values(requested_admission_number, requested_first_name, requested_last_name, requested_date_of_birth, requested_enrolled_on, requested_status)
  returning id into student_id;
  insert into public.parents(first_name, last_name, phone, email)
  values(requested_guardian_first_name, requested_guardian_last_name, requested_guardian_phone, requested_guardian_email)
  returning id into guardian_id;
  insert into public.parent_student_links(parent_id, student_id, relationship, is_primary_contact)
  values(guardian_id, student_id, requested_guardian_relationship, true);
  if requested_academic_year_id is not null then
    insert into public.student_enrollments(student_id, academic_year_id, section_id, enrolled_on, status)
    values(student_id, requested_academic_year_id, requested_section_id, requested_enrolled_on, 'active');
  end if;
  return student_id;
end;
$$;
grant execute on function public.create_student_with_guardian(text,text,text,date,date,public.student_status,text,text,text,text,text,uuid,uuid) to authenticated;

-- Serialize concurrent enrollment attempts for a section before its capacity
-- is counted. The existing unique active-enrollment index handles per-student
-- races; this lock protects capacity itself.
create or replace function private.validate_section_capacity()
returns trigger language plpgsql set search_path = public, pg_temp as $$
declare section_capacity smallint; active_students integer;
begin
  if new.status <> 'active' then return new; end if;
  select capacity into section_capacity from public.sections where id = new.section_id for update;
  select count(*) into active_students from public.student_enrollments
  where section_id = new.section_id and academic_year_id = new.academic_year_id
    and status = 'active' and id is distinct from new.id;
  if active_students >= section_capacity then raise exception 'This section has reached its capacity'; end if;
  return new;
end;
$$;

-- Grade data is append/update-only during an editable exam. Closed and
-- published gradebooks are immutable at the database boundary.
create or replace function private.lock_published_grade_entries()
returns trigger language plpgsql set search_path = public, pg_temp as $$
declare exam_state public.exam_status;
begin
  if tg_op = 'DELETE' then raise exception 'Grade entries are retained for academic history'; end if;
  select e.status into exam_state from public.exam_subjects es join public.exams e on e.id = es.exam_id
  where es.id = new.exam_subject_id;
  if exam_state not in ('draft', 'open') then raise exception 'Only draft or open exam grades can be changed'; end if;
  return new;
end;
$$;

create or replace function public.save_exam_grades(requested_exam_subject_id uuid, requested_records jsonb)
returns integer language plpgsql security invoker set search_path = public, auth, pg_temp as $$
declare saved_count integer; exam_state public.exam_status;
begin
  select e.status into exam_state from public.exam_subjects es join public.exams e on e.id = es.exam_id
  where es.id = requested_exam_subject_id for update of e;
  if not found or exam_state not in ('draft', 'open') then raise exception 'Grades can only be saved while the exam is draft or open'; end if;
  if jsonb_typeof(requested_records) <> 'array' or jsonb_array_length(requested_records) = 0 then raise exception 'At least one grade is required'; end if;
  if exists (select 1 from jsonb_to_recordset(requested_records) as r(student_id uuid, marks numeric, status public.grade_entry_status, remarks text) where not (select private.can_manage_grade(requested_exam_subject_id, r.student_id))) then raise exception 'You can only enter grades for your assigned subject and section'; end if;
  if exists (select 1 from jsonb_to_recordset(requested_records) as r(student_id uuid, marks numeric, status public.grade_entry_status, remarks text) group by r.student_id having count(*) > 1) then raise exception 'A student may only appear once in a grade save'; end if;
  insert into public.grade_entries(exam_subject_id, student_id, marks, status, remarks, marked_by)
  select requested_exam_subject_id, r.student_id, r.marks, r.status, nullif(trim(r.remarks), ''), auth.uid()
  from jsonb_to_recordset(requested_records) as r(student_id uuid, marks numeric, status public.grade_entry_status, remarks text)
  on conflict (exam_subject_id, student_id) do update set marks=excluded.marks, status=excluded.status, remarks=excluded.remarks, marked_by=excluded.marked_by, updated_at=timezone('utc', now());
  get diagnostics saved_count = row_count;
  return saved_count;
end;
$$;

create or replace function public.publish_exam(requested_exam_id uuid)
returns void language plpgsql security invoker set search_path = public, auth, pg_temp as $$
declare exam_state public.exam_status;
begin
  if not (select private.is_admin()) then raise exception 'Only administrators can publish results'; end if;
  select status into exam_state from public.exams where id = requested_exam_id for update;
  if not found or exam_state not in ('draft', 'open') then raise exception 'Only a draft or open exam can be published'; end if;
  if not exists (select 1 from public.exam_subjects where exam_id = requested_exam_id) then raise exception 'Add at least one subject before publishing an exam'; end if;
  if exists (
    select 1 from public.exam_subjects es join public.exams e on e.id = es.exam_id join public.terms t on t.id = e.term_id
    join public.student_enrollments se on se.section_id = es.section_id and se.academic_year_id = t.academic_year_id and se.status in ('active', 'completed', 'transferred')
    left join public.grade_entries ge on ge.exam_subject_id = es.id and ge.student_id = se.student_id
    where es.exam_id = requested_exam_id and ge.id is null
  ) then raise exception 'Enter a grade, absence, or exemption for every enrolled student before publishing'; end if;
  update public.exams set status='published', updated_at=timezone('utc', now()) where id=requested_exam_id;
end;
$$;
