begin;
select plan(9);

select has_function('public', 'create_student_with_guardian', 'student creation is one transactional RPC');
select has_function('public', 'save_fee_record', 'fee record workflow remains an RPC');
select has_function('public', 'record_fee_payment', 'fee payment workflow remains an RPC');
select has_function('public', 'save_exam_grades', 'grade workflow remains an RPC');
select has_function('public', 'publish_exam', 'exam publication remains an RPC');
select hasnt_policy('public', 'fee_records', 'admin_manage_fee_records', 'direct fee-record writes are removed');
select hasnt_policy('public', 'fee_payments', 'admin_manage_fee_payments', 'direct payment writes are removed');
select has_trigger('public', 'grade_entries', 'lock_published_grade_entries', 'grade immutability trigger exists');
select has_index('public', 'student_enrollments', 'student_enrollments_one_active_year_idx', 'active enrollment uniqueness remains enforced');

select * from finish();
rollback;
