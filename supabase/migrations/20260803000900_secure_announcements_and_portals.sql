-- Announcement management and target validation.
create table public.announcement_academic_year_audiences (
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete restrict,
  primary key (announcement_id, academic_year_id)
);
alter table public.announcement_academic_year_audiences enable row level security;
grant select, insert, update, delete on public.announcement_academic_year_audiences to authenticated;

create or replace function private.can_view_announcement(requested_announcement_id uuid)
returns boolean language sql stable security definer set search_path = public, auth, pg_temp as $$
  select (select private.can_manage_announcement(requested_announcement_id)) or exists (
    select 1 from public.announcements a where a.id = requested_announcement_id and a.status = 'published'
      and a.published_at <= timezone('utc', now()) and (a.expires_at is null or a.expires_at > timezone('utc', now()))
      and (a.audience_scope = 'all'
        or exists (select 1 from public.announcement_role_audiences ara where ara.announcement_id = a.id and ara.role = (select private.current_role()))
        or exists (select 1 from public.announcement_section_audiences asa join public.student_enrollments se on se.section_id = asa.section_id and se.status = 'active' left join public.students s on s.id = se.student_id left join public.parent_student_links psl on psl.student_id = se.student_id left join public.parents p on p.id = psl.parent_id left join public.teachers t on t.profile_id = (select auth.uid()) left join public.teacher_assignments ta on ta.teacher_id = t.id and ta.section_id = asa.section_id and ta.academic_year_id = se.academic_year_id where asa.announcement_id = a.id and (s.profile_id = (select auth.uid()) or p.profile_id = (select auth.uid()) or ta.id is not null))
        or exists (select 1 from public.announcement_class_audiences aca join public.sections sr on sr.class_id = aca.class_id join public.student_enrollments se on se.section_id = sr.id and se.status = 'active' left join public.students s on s.id = se.student_id left join public.parent_student_links psl on psl.student_id = se.student_id left join public.parents p on p.id = psl.parent_id left join public.teachers t on t.profile_id = (select auth.uid()) left join public.teacher_assignments ta on ta.teacher_id = t.id and ta.section_id = sr.id and ta.academic_year_id = se.academic_year_id where aca.announcement_id = a.id and (s.profile_id = (select auth.uid()) or p.profile_id = (select auth.uid()) or ta.id is not null))
        or exists (select 1 from public.announcement_academic_year_audiences aya left join public.student_enrollments se on se.academic_year_id = aya.academic_year_id and se.status = 'active' left join public.students s on s.id = se.student_id left join public.parent_student_links psl on psl.student_id = se.student_id left join public.parents p on p.id = psl.parent_id left join public.teachers t on t.profile_id = (select auth.uid()) left join public.teacher_assignments ta on ta.teacher_id = t.id and ta.academic_year_id = aya.academic_year_id where aya.announcement_id = a.id and (s.profile_id = (select auth.uid()) or p.profile_id = (select auth.uid()) or ta.id is not null))
      )
  )
$$;

create or replace function private.can_set_announcement_section(announcement_id uuid, section_id uuid)
returns boolean language sql stable security definer set search_path = public, auth, pg_temp as $$
  select (select private.is_admin()) or ((select private.can_manage_announcement(announcement_id)) and (select private.has_teacher_assignment(section_id, null, null)))
$$;

drop policy if exists announcement_section_audiences_manage_authorized on public.announcement_section_audiences;
create policy announcement_section_audiences_insert_scoped on public.announcement_section_audiences for insert to authenticated with check ((select private.can_set_announcement_section(announcement_id, section_id)));
create policy announcement_section_audiences_update_scoped on public.announcement_section_audiences for update to authenticated using ((select private.can_manage_announcement(announcement_id))) with check ((select private.can_set_announcement_section(announcement_id, section_id)));
create policy announcement_section_audiences_delete_scoped on public.announcement_section_audiences for delete to authenticated using ((select private.can_manage_announcement(announcement_id)));

drop policy if exists announcement_role_audiences_manage_authorized on public.announcement_role_audiences;
drop policy if exists announcement_class_audiences_manage_authorized on public.announcement_class_audiences;
create policy announcement_role_audiences_manage_admin on public.announcement_role_audiences for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy announcement_class_audiences_manage_admin on public.announcement_class_audiences for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy announcement_year_audiences_read_scoped on public.announcement_academic_year_audiences for select to authenticated using ((select private.can_view_announcement(announcement_id)));
create policy announcement_year_audiences_manage_admin on public.announcement_academic_year_audiences for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

create or replace function public.save_announcement(
  requested_announcement_id uuid, requested_title text, requested_body text, requested_status public.announcement_status,
  requested_audience_scope text, requested_published_on date, requested_expires_on date,
  requested_roles public.app_role[], requested_class_ids uuid[], requested_section_ids uuid[], requested_year_ids uuid[]
) returns uuid language plpgsql security invoker set search_path = public, auth, pg_temp as $$
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
  if requested_announcement_id is null then insert into public.announcements (author_id,title,body,status,audience_scope,published_at,expires_at) values (auth.uid(),trim(requested_title),trim(requested_body),requested_status,requested_audience_scope,case when requested_status='published' then requested_published_on::timestamptz else null end,case when requested_expires_on is null then null else (requested_expires_on + 1)::timestamptz end) returning id into saved_announcement_id;
  else
    if not (select private.can_manage_announcement(requested_announcement_id)) then raise exception 'You cannot edit this announcement'; end if;
    update public.announcements set title=trim(requested_title),body=trim(requested_body),status=requested_status,audience_scope=requested_audience_scope,published_at=case when requested_status='published' then requested_published_on::timestamptz else null end,expires_at=case when requested_expires_on is null then null else (requested_expires_on + 1)::timestamptz end where id=requested_announcement_id returning id into saved_announcement_id;
    delete from public.announcement_role_audiences ara where ara.announcement_id=saved_announcement_id; delete from public.announcement_class_audiences aca where aca.announcement_id=saved_announcement_id; delete from public.announcement_section_audiences asa where asa.announcement_id=saved_announcement_id; delete from public.announcement_academic_year_audiences aya where aya.announcement_id=saved_announcement_id;
  end if;
  insert into public.announcement_role_audiences select saved_announcement_id, role from unnest(coalesce(requested_roles, '{}'::public.app_role[])) role;
  insert into public.announcement_class_audiences select saved_announcement_id, class_id from unnest(coalesce(requested_class_ids, '{}'::uuid[])) class_id;
  insert into public.announcement_section_audiences select saved_announcement_id, section_id from unnest(coalesce(requested_section_ids, '{}'::uuid[])) section_id;
  insert into public.announcement_academic_year_audiences select saved_announcement_id, year_id from unnest(coalesce(requested_year_ids, '{}'::uuid[])) year_id;
  return saved_announcement_id;
end;
$$;
grant execute on function public.save_announcement(uuid,text,text,public.announcement_status,text,date,date,public.app_role[],uuid[],uuid[],uuid[]) to authenticated;
