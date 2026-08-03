-- Complete the manual fee workflow. Payments are never processed online.
alter table public.fee_types
  add column description text,
  add column frequency text not null default 'one_time' check (frequency in ('one_time', 'monthly', 'termly', 'annual')),
  add column academic_year_id uuid references public.academic_years(id) on delete restrict;

alter table public.fee_records
  add column created_by uuid references public.profiles(id) on delete restrict;

alter table public.fee_payments
  add column payment_method text not null default 'cash' check (char_length(trim(payment_method)) between 1 and 50);

create index fee_types_year_idx on public.fee_types (academic_year_id, is_active);
create index fee_records_year_status_due_idx on public.fee_records (academic_year_id, status, due_date);

create or replace function private.refresh_fee_record_status(requested_fee_record_id uuid)
returns void language plpgsql security definer set search_path = public, auth, pg_temp as $$
declare due numeric(12,2); paid numeric(12,2); due_on date;
begin
  select amount_due, due_date into due, due_on from public.fee_records where id = requested_fee_record_id for update;
  if not found then return; end if;
  select coalesce(sum(amount), 0) into paid from public.fee_payments where fee_record_id = requested_fee_record_id;
  update public.fee_records set status = case
    when paid >= due then 'paid'::public.fee_record_status
    when paid > 0 then 'partially_paid'::public.fee_record_status
    when due_on < current_date then 'overdue'::public.fee_record_status
    else 'unpaid'::public.fee_record_status
  end where id = requested_fee_record_id;
end;
$$;

create or replace function private.sync_fee_record_status()
returns trigger language plpgsql security definer set search_path = public, auth, pg_temp as $$
begin
  perform private.refresh_fee_record_status(coalesce(new.fee_record_id, old.fee_record_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists sync_fee_record_status_from_payment on public.fee_payments;
create trigger sync_fee_record_status_from_payment after insert or update or delete on public.fee_payments
for each row execute function private.sync_fee_record_status();

create or replace function public.save_fee_record(
  requested_fee_record_id uuid, requested_student_id uuid, requested_fee_type_id uuid,
  requested_academic_year_id uuid, requested_term_id uuid, requested_amount_due numeric,
  requested_due_date date, requested_notes text
) returns uuid language plpgsql security invoker set search_path = public, auth, pg_temp as $$
declare record_id uuid;
begin
  if not (select private.is_admin()) then raise exception 'Only administrators can manage fee records'; end if;
  if requested_amount_due < 0 then raise exception 'Amount due cannot be negative'; end if;
  if requested_term_id is not null and not exists (select 1 from public.terms where id = requested_term_id and academic_year_id = requested_academic_year_id) then raise exception 'The term must belong to the selected academic year'; end if;
  if requested_fee_record_id is null then
    insert into public.fee_records(student_id, fee_type_id, academic_year_id, term_id, amount_due, due_date, notes, created_by)
    values(requested_student_id, requested_fee_type_id, requested_academic_year_id, requested_term_id, requested_amount_due, requested_due_date, nullif(trim(requested_notes), ''), auth.uid()) returning id into record_id;
  else
    if exists (select 1 from public.fee_payments where fee_record_id = requested_fee_record_id) and requested_amount_due < (select coalesce(sum(amount), 0) from public.fee_payments where fee_record_id = requested_fee_record_id) then raise exception 'Amount due cannot be below recorded payments'; end if;
    update public.fee_records set student_id=requested_student_id, fee_type_id=requested_fee_type_id, academic_year_id=requested_academic_year_id, term_id=requested_term_id, amount_due=requested_amount_due, due_date=requested_due_date, notes=nullif(trim(requested_notes), '') where id=requested_fee_record_id returning id into record_id;
  end if;
  perform private.refresh_fee_record_status(record_id);
  return record_id;
end;
$$;

create or replace function public.record_fee_payment(
  requested_fee_record_id uuid, requested_amount numeric, requested_paid_on date,
  requested_payment_method text, requested_receipt_number text, requested_notes text
) returns uuid language plpgsql security invoker set search_path = public, auth, pg_temp as $$
declare payment_id uuid;
begin
  if not (select private.is_admin()) then raise exception 'Only administrators can record payments'; end if;
  if requested_amount <= 0 then raise exception 'Payment amount must be greater than zero'; end if;
  insert into public.fee_payments(fee_record_id, amount, paid_on, payment_method, receipt_number, recorded_by, notes)
  values(requested_fee_record_id, requested_amount, requested_paid_on, trim(requested_payment_method), trim(requested_receipt_number), auth.uid(), nullif(trim(requested_notes), '')) returning id into payment_id;
  return payment_id;
end;
$$;

grant execute on function public.save_fee_record(uuid,uuid,uuid,uuid,uuid,numeric,date,text) to authenticated;
grant execute on function public.record_fee_payment(uuid,numeric,date,text,text,text) to authenticated;
