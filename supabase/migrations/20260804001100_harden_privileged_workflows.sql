-- Production hardening: privileged workflows must remain authoritative even
-- when an authenticated user calls PostgREST directly instead of the UI.

-- storage.objects.owner_id is text. Compare it to the authenticated UUID as
-- text so these policies work with the Supabase Storage schema.
drop policy if exists profile_photos_read_own_or_admin on storage.objects;
drop policy if exists profile_photos_upload_own_or_admin on storage.objects;
drop policy if exists profile_photos_update_own_or_admin on storage.objects;
drop policy if exists profile_photos_delete_own_or_admin on storage.objects;

create policy profile_photos_read_own_or_admin on storage.objects
for select to authenticated
using (bucket_id = 'profile-photos' and (owner_id = (select auth.uid()::text) or (select private.is_admin())));

create policy profile_photos_upload_own_or_admin on storage.objects
for insert to authenticated
with check (bucket_id = 'profile-photos' and ((storage.foldername(name))[1] = (select auth.uid()::text) or (select private.is_admin())));

create policy profile_photos_update_own_or_admin on storage.objects
for update to authenticated
using (bucket_id = 'profile-photos' and (owner_id = (select auth.uid()::text) or (select private.is_admin())))
with check (bucket_id = 'profile-photos' and ((storage.foldername(name))[1] = (select auth.uid()::text) or (select private.is_admin())));

create policy profile_photos_delete_own_or_admin on storage.objects
for delete to authenticated
using (bucket_id = 'profile-photos' and (owner_id = (select auth.uid()::text) or (select private.is_admin())));

-- Fee records and payments are financial history. Their only write path is
-- the checked RPCs below; the read policies from migration 003 remain active.
drop policy if exists admin_manage_fee_records on public.fee_records;
drop policy if exists admin_manage_fee_payments on public.fee_payments;

create or replace function public.save_fee_record(
  requested_fee_record_id uuid, requested_student_id uuid, requested_fee_type_id uuid,
  requested_academic_year_id uuid, requested_term_id uuid, requested_amount_due numeric,
  requested_due_date date, requested_notes text
) returns uuid language plpgsql security definer set search_path = public, auth, pg_temp as $$
declare
  record_id uuid;
  existing_record public.fee_records;
begin
  if not (select private.is_admin()) then raise exception 'Only administrators can manage fee records'; end if;
  if requested_amount_due < 0 then raise exception 'Amount due cannot be negative'; end if;
  if requested_term_id is not null and not exists (select 1 from public.terms where id = requested_term_id and academic_year_id = requested_academic_year_id) then raise exception 'The term must belong to the selected academic year'; end if;

  if requested_fee_record_id is null then
    insert into public.fee_records(student_id, fee_type_id, academic_year_id, term_id, amount_due, due_date, notes, created_by)
    values(requested_student_id, requested_fee_type_id, requested_academic_year_id, requested_term_id, requested_amount_due, requested_due_date, nullif(trim(requested_notes), ''), auth.uid())
    returning id into record_id;
  else
    select * into existing_record from public.fee_records where id = requested_fee_record_id for update;
    if not found then raise exception 'Fee record was not found'; end if;
    if exists (select 1 from public.fee_payments where fee_record_id = requested_fee_record_id)
      and (existing_record.student_id <> requested_student_id or existing_record.fee_type_id <> requested_fee_type_id or existing_record.academic_year_id <> requested_academic_year_id or existing_record.term_id is distinct from requested_term_id) then
      raise exception 'A fee record with payments cannot be reassigned';
    end if;
    if requested_amount_due < (select coalesce(sum(amount), 0) from public.fee_payments where fee_record_id = requested_fee_record_id) then
      raise exception 'Amount due cannot be below recorded payments';
    end if;
    update public.fee_records
    set student_id = requested_student_id, fee_type_id = requested_fee_type_id, academic_year_id = requested_academic_year_id,
        term_id = requested_term_id, amount_due = requested_amount_due, due_date = requested_due_date, notes = nullif(trim(requested_notes), '')
    where id = requested_fee_record_id
    returning id into record_id;
  end if;
  perform private.refresh_fee_record_status(record_id);
  return record_id;
end;
$$;

create or replace function public.record_fee_payment(
  requested_fee_record_id uuid, requested_amount numeric, requested_paid_on date,
  requested_payment_method text, requested_receipt_number text, requested_notes text
) returns uuid language plpgsql security definer set search_path = public, auth, pg_temp as $$
declare
  payment_id uuid;
  amount_due numeric(12, 2);
  paid_total numeric(12, 2);
begin
  if not (select private.is_admin()) then raise exception 'Only administrators can record payments'; end if;
  if requested_amount <= 0 then raise exception 'Payment amount must be greater than zero'; end if;
  select fr.amount_due into amount_due from public.fee_records fr where fr.id = requested_fee_record_id for update;
  if not found then raise exception 'Fee record was not found'; end if;
  select coalesce(sum(amount), 0) into paid_total from public.fee_payments where fee_record_id = requested_fee_record_id;
  if paid_total + requested_amount > amount_due then raise exception 'Fee payments cannot exceed the amount due'; end if;
  insert into public.fee_payments(fee_record_id, amount, paid_on, payment_method, receipt_number, recorded_by, notes)
  values(requested_fee_record_id, requested_amount, requested_paid_on, trim(requested_payment_method), trim(requested_receipt_number), auth.uid(), nullif(trim(requested_notes), ''))
  returning id into payment_id;
  return payment_id;
end;
$$;

-- Teachers must use the validated announcement RPC. Administrators retain
-- their full administrative data-management scope.
drop policy if exists announcements_insert_authorized on public.announcements;
drop policy if exists announcements_update_authorized on public.announcements;
drop policy if exists announcement_section_audiences_insert_scoped on public.announcement_section_audiences;
drop policy if exists announcement_section_audiences_update_scoped on public.announcement_section_audiences;
drop policy if exists announcement_section_audiences_delete_scoped on public.announcement_section_audiences;

create or replace function public.save_announcement(
  requested_announcement_id uuid, requested_title text, requested_body text, requested_status public.announcement_status,
  requested_audience_scope text, requested_published_on date, requested_expires_on date,
  requested_roles public.app_role[], requested_class_ids uuid[], requested_section_ids uuid[], requested_year_ids uuid[]
) returns uuid language plpgsql security definer set search_path = public, auth, pg_temp as $$
declare saved_announcement_id uuid;
begin
  if not ((select private.is_admin()) or (select private.is_teacher())) then raise exception 'Only administrators and teachers can manage announcements'; end if;
  if requested_audience_scope not in ('all', 'targeted') then raise exception 'Choose a valid audience'; end if;
  if requested_status = 'published' and requested_published_on is null then raise exception 'A publish date is required'; end if;
  if requested_expires_on is not null and requested_published_on is not null and requested_expires_on <= requested_published_on then raise exception 'Expiry date must be after publish date'; end if;
  if (select private.is_teacher()) then
    if requested_audience_scope <> 'targeted' or coalesce(cardinality(requested_section_ids), 0) = 0 or coalesce(cardinality(requested_roles), 0) > 0 or coalesce(cardinality(requested_class_ids), 0) > 0 or coalesce(cardinality(requested_year_ids), 0) > 0 then raise exception 'Teachers may target only one or more assigned sections'; end if;
    if exists (select 1 from unnest(requested_section_ids) section_id where not (select private.has_teacher_assignment(section_id, null, null))) then raise exception 'A teacher may only target assigned sections'; end if;
  end if;
  if requested_audience_scope = 'all' and (coalesce(cardinality(requested_roles),0) + coalesce(cardinality(requested_class_ids),0) + coalesce(cardinality(requested_section_ids),0) + coalesce(cardinality(requested_year_ids),0)) > 0 then raise exception 'All-user announcements cannot include additional targets'; end if;
  if requested_audience_scope = 'targeted' and (coalesce(cardinality(requested_roles),0) + coalesce(cardinality(requested_class_ids),0) + coalesce(cardinality(requested_section_ids),0) + coalesce(cardinality(requested_year_ids),0)) = 0 then raise exception 'Choose at least one audience target'; end if;
  if requested_announcement_id is null then
    insert into public.announcements(author_id,title,body,status,audience_scope,published_at,expires_at)
    values(auth.uid(),trim(requested_title),trim(requested_body),requested_status,requested_audience_scope,case when requested_status='published' then requested_published_on::timestamptz else null end,case when requested_expires_on is null then null else (requested_expires_on + 1)::timestamptz end)
    returning id into saved_announcement_id;
  else
    if not (select private.can_manage_announcement(requested_announcement_id)) then raise exception 'You cannot edit this announcement'; end if;
    update public.announcements set title=trim(requested_title),body=trim(requested_body),status=requested_status,audience_scope=requested_audience_scope,published_at=case when requested_status='published' then requested_published_on::timestamptz else null end,expires_at=case when requested_expires_on is null then null else (requested_expires_on + 1)::timestamptz end where id=requested_announcement_id returning id into saved_announcement_id;
    delete from public.announcement_role_audiences where announcement_id=saved_announcement_id;
    delete from public.announcement_class_audiences where announcement_id=saved_announcement_id;
    delete from public.announcement_section_audiences where announcement_id=saved_announcement_id;
    delete from public.announcement_academic_year_audiences where announcement_id=saved_announcement_id;
  end if;
  insert into public.announcement_role_audiences select saved_announcement_id, role from unnest(coalesce(requested_roles, '{}'::public.app_role[])) role;
  insert into public.announcement_class_audiences select saved_announcement_id, class_id from unnest(coalesce(requested_class_ids, '{}'::uuid[])) class_id;
  insert into public.announcement_section_audiences select saved_announcement_id, section_id from unnest(coalesce(requested_section_ids, '{}'::uuid[])) section_id;
  insert into public.announcement_academic_year_audiences select saved_announcement_id, year_id from unnest(coalesce(requested_year_ids, '{}'::uuid[])) year_id;
  return saved_announcement_id;
end;
$$;
