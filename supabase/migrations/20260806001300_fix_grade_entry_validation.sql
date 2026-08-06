-- Fix the trigger variable/table-column ambiguity in the original grade
-- validation function. Existing databases receive this forward-only repair.
create or replace function private.validate_grade_entry()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  exam_subject_record public.exam_subjects;
  exam_academic_year_id uuid;
begin
  select es.* into exam_subject_record
  from public.exam_subjects es
  where es.id = new.exam_subject_id;

  if new.status = 'graded' and new.marks > exam_subject_record.maximum_marks then
    raise exception 'Grade marks cannot exceed maximum marks';
  end if;

  select term.academic_year_id into exam_academic_year_id
  from public.exams exam
  join public.terms term on term.id = exam.term_id
  where exam.id = exam_subject_record.exam_id;

  if not exists (
    select 1
    from public.student_enrollments se
    where se.student_id = new.student_id
      and se.section_id = exam_subject_record.section_id
      and se.academic_year_id = exam_academic_year_id
      and se.status in ('active', 'completed', 'transferred')
  ) then
    raise exception 'Grade entry requires a student enrollment in the exam section';
  end if;

  return new;
end;
$$;
