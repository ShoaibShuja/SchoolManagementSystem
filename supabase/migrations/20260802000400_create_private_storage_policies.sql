insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('profile-photos', 'profile-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('school-documents', 'school-documents', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png']),
  ('report-cards', 'report-cards', false, 10485760, array['application/pdf'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy profile_photos_read_own_or_admin on storage.objects
for select to authenticated
using (
  bucket_id = 'profile-photos'
  and (
    owner_id = (select auth.uid()::text)
    or (select private.is_admin())
  )
);

create policy profile_photos_upload_own_or_admin on storage.objects
for insert to authenticated
with check (
  bucket_id = 'profile-photos'
  and (
    (storage.foldername(name))[1] = (select auth.uid()::text)
    or (select private.is_admin())
  )
);

create policy profile_photos_update_own_or_admin on storage.objects
for update to authenticated
using (
  bucket_id = 'profile-photos'
  and (owner_id = (select auth.uid()::text) or (select private.is_admin()))
)
with check (
  bucket_id = 'profile-photos'
  and ((storage.foldername(name))[1] = (select auth.uid()::text) or (select private.is_admin()))
);

create policy profile_photos_delete_own_or_admin on storage.objects
for delete to authenticated
using (
  bucket_id = 'profile-photos'
  and (owner_id = (select auth.uid()::text) or (select private.is_admin()))
);

create policy school_documents_admin_only on storage.objects
for all to authenticated
using (bucket_id = 'school-documents' and (select private.is_admin()))
with check (bucket_id = 'school-documents' and (select private.is_admin()));

create policy report_cards_admin_only on storage.objects
for all to authenticated
using (bucket_id = 'report-cards' and (select private.is_admin()))
with check (bucket_id = 'report-cards' and (select private.is_admin()));
