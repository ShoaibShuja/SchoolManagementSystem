revoke all on all tables in schema public from anon;
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'academic_years', 'terms', 'classes', 'sections', 'subjects', 'teachers', 'students', 'parents',
    'parent_student_links', 'teacher_assignments', 'student_enrollments', 'timetable_entries', 'attendance_records',
    'exams', 'exam_subjects', 'grade_entries', 'fee_types', 'fee_records', 'fee_payments', 'announcements',
    'announcement_role_audiences', 'announcement_class_audiences', 'announcement_section_audiences'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end;
$$;

create policy profiles_select_self_or_admin on public.profiles
for select to authenticated
using (id = (select auth.uid()) or (select private.is_admin()));

create policy profiles_update_self on public.profiles
for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()) and role = (select private.current_role()));

create policy profiles_admin_manage on public.profiles
for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'academic_years', 'terms', 'classes', 'sections', 'subjects', 'teachers', 'students', 'parents',
    'parent_student_links', 'teacher_assignments', 'student_enrollments', 'timetable_entries', 'attendance_records',
    'exams', 'exam_subjects', 'grade_entries', 'fee_types', 'fee_records', 'fee_payments', 'announcements',
    'announcement_role_audiences', 'announcement_class_audiences', 'announcement_section_audiences'
  ]
  loop
    execute format(
      'create policy %I on public.%I for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()))',
      'admin_manage_' || table_name,
      table_name
    );
  end loop;
end;
$$;

create policy academic_years_read_authenticated on public.academic_years
for select to authenticated using (true);

create policy terms_read_authenticated on public.terms
for select to authenticated using (true);

create policy classes_read_assigned on public.classes
for select to authenticated
using (exists (select 1 from public.sections s where s.class_id = classes.id and (select private.can_view_section_any_year(s.id))));

create policy sections_read_assigned on public.sections
for select to authenticated
using ((select private.can_view_section_any_year(id)));

create policy subjects_read_assigned on public.subjects
for select to authenticated
using ((select private.can_view_subject(id)));

create policy teachers_read_self_or_admin on public.teachers
for select to authenticated
using (profile_id = (select auth.uid()) or (select private.is_admin()));

create policy students_read_scoped on public.students
for select to authenticated
using ((select private.can_access_student(id)));

create policy parents_read_self_or_admin on public.parents
for select to authenticated
using (profile_id = (select auth.uid()) or (select private.is_admin()));

create policy parent_links_read_scoped on public.parent_student_links
for select to authenticated
using (
  (select private.is_admin())
  or exists (select 1 from public.parents p where p.id = parent_student_links.parent_id and p.profile_id = (select auth.uid()))
);

create policy teacher_assignments_read_scoped on public.teacher_assignments
for select to authenticated
using (
  (select private.has_teacher_assignment(section_id, subject_id, academic_year_id))
  or (select private.can_view_section(section_id, academic_year_id))
);

create policy enrollments_read_scoped on public.student_enrollments
for select to authenticated
using (
  (select private.can_access_student(student_id))
  or (select private.has_teacher_assignment(section_id, null, academic_year_id))
);

create policy timetable_read_scoped on public.timetable_entries
for select to authenticated
using ((select private.can_view_section(section_id, academic_year_id)));

create policy attendance_read_scoped on public.attendance_records
for select to authenticated
using ((select private.can_view_attendance(student_id, section_id, academic_year_id)));

create policy attendance_insert_assigned on public.attendance_records
for insert to authenticated
with check (
  marked_by = (select auth.uid())
  and (select private.has_teacher_assignment(section_id, null, academic_year_id))
);

create policy attendance_update_assigned on public.attendance_records
for update to authenticated
using ((select private.has_teacher_assignment(section_id, null, academic_year_id)))
with check (
  marked_by = (select auth.uid())
  and (select private.has_teacher_assignment(section_id, null, academic_year_id))
);

create policy exams_read_scoped on public.exams
for select to authenticated
using ((select private.can_view_exam(id)));

create policy exam_subjects_read_scoped on public.exam_subjects
for select to authenticated
using (
  exists (
    select 1 from public.exams e join public.terms t on t.id = e.term_id
    where e.id = exam_subjects.exam_id and (select private.can_view_section(exam_subjects.section_id, t.academic_year_id))
  )
);

create policy grades_read_scoped on public.grade_entries
for select to authenticated
using ((select private.can_view_grade(exam_subject_id, student_id)));

create policy grades_insert_assigned on public.grade_entries
for insert to authenticated
with check (
  marked_by = (select auth.uid())
  and (select private.can_manage_grade(exam_subject_id, student_id))
);

create policy grades_update_assigned on public.grade_entries
for update to authenticated
using ((select private.can_manage_grade(exam_subject_id, student_id)))
with check (
  marked_by = (select auth.uid())
  and (select private.can_manage_grade(exam_subject_id, student_id))
);

create policy fee_types_read_authenticated on public.fee_types
for select to authenticated using (true);

create policy fee_records_read_scoped on public.fee_records
for select to authenticated
using ((select private.can_access_fee(student_id)));

create policy fee_payments_read_scoped on public.fee_payments
for select to authenticated
using (exists (select 1 from public.fee_records fr where fr.id = fee_payments.fee_record_id and (select private.can_access_fee(fr.student_id))));

create policy announcements_read_scoped on public.announcements
for select to authenticated
using ((select private.can_view_announcement(id)));

create policy announcements_insert_authorized on public.announcements
for insert to authenticated
with check (
  author_id = (select auth.uid())
  and ((select private.is_admin()) or (select private.is_teacher()))
);

create policy announcements_update_authorized on public.announcements
for update to authenticated
using ((select private.can_manage_announcement(id)))
with check (
  author_id = (select auth.uid())
  and ((select private.is_admin()) or (select private.is_teacher()))
);

create policy announcement_role_audiences_read_scoped on public.announcement_role_audiences
for select to authenticated
using ((select private.can_view_announcement(announcement_id)));

create policy announcement_class_audiences_read_scoped on public.announcement_class_audiences
for select to authenticated
using ((select private.can_view_announcement(announcement_id)));

create policy announcement_section_audiences_read_scoped on public.announcement_section_audiences
for select to authenticated
using ((select private.can_view_announcement(announcement_id)));

create policy announcement_role_audiences_manage_authorized on public.announcement_role_audiences
for all to authenticated
using ((select private.can_manage_announcement(announcement_id)))
with check ((select private.can_manage_announcement(announcement_id)));

create policy announcement_class_audiences_manage_authorized on public.announcement_class_audiences
for all to authenticated
using ((select private.can_manage_announcement(announcement_id)))
with check ((select private.can_manage_announcement(announcement_id)));

create policy announcement_section_audiences_manage_authorized on public.announcement_section_audiences
for all to authenticated
using ((select private.can_manage_announcement(announcement_id)))
with check ((select private.can_manage_announcement(announcement_id)));
