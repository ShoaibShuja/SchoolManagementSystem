begin;
select plan(12);

select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'students', 'students table exists');
select has_table('public', 'attendance_records', 'attendance table exists');
select has_table('public', 'grade_entries', 'grade table exists');
select has_table('public', 'fee_records', 'fee table exists');
select col_is_pk('public', 'profiles', 'id', 'profiles uses auth user id as primary key');
select col_is_pk('public', 'student_enrollments', 'id', 'enrollments have a primary key');
select has_index('public', 'attendance_records', 'attendance_records_student_date_idx', 'attendance history index exists');
select has_index('public', 'teacher_assignments', 'teacher_assignments_teacher_scope_idx', 'teacher scope index exists');
select has_policy('public', 'profiles', 'profiles_select_self_or_admin', 'profile ownership policy exists');
select has_policy('public', 'attendance_records', 'attendance_insert_assigned', 'attendance teacher policy exists');
select has_policy('public', 'grade_entries', 'grades_insert_assigned', 'grade teacher policy exists');

select * from finish();
rollback;
