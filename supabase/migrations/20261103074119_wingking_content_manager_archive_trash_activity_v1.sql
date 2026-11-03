-- Schema migration imported from user's Wingking Supabase project.
-- Version: 20261103074119
-- Apply using Supabase CLI on a fresh project; do not rerun on live database.

-- Wingking Content Manager v1: reversible archive and trash.
-- No existing content is changed by this migration.
alter table public.wk_public_submissions add column if not exists archived_at timestamptz, add column if not exists deleted_at timestamptz;
alter table public.wk_guest_posts add column if not exists archived_at timestamptz, add column if not exists deleted_at timestamptz;
alter table public.wk_bands add column if not exists archived_at timestamptz, add column if not exists deleted_at timestamptz;
alter table public.wk_releases add column if not exists archived_at timestamptz, add column if not exists deleted_at timestamptz;
alter table public.wk_clips add column if not exists archived_at timestamptz, add column if not exists deleted_at timestamptz;

create table if not exists public.wk_content_activity (
 id uuid primary key default gen_random_uuid(),
 actor_id uuid references auth.users(id) on delete set null,
 source text not null check (source in ('public','band','release','clip','guest')),
 content_id uuid not null,
 action text not null check (action in ('edit','archive','restore','trash','restore_trash','purge','approve','reject')),
 label text not null default '',
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create index if not exists wk_content_activity_created_idx on public.wk_content_activity (created_at desc);
create index if not exists wk_content_activity_target_idx on public.wk_content_activity (source,content_id,created_at desc);
alter table public.wk_content_activity enable row level security;
revoke all on public.wk_content_activity from public,anon,authenticated;
grant select on public.wk_content_activity to authenticated;
grant all on public.wk_content_activity to service_role;
drop policy if exists wk_content_activity_moderator_read on public.wk_content_activity;
create policy wk_content_activity_moderator_read on public.wk_content_activity for select to authenticated using ((select private.wk_is_moderator()));

create or replace function private.wk_submission_review_gate()
returns trigger language plpgsql security definer set search_path = ''
as $fn$
begin
 if TG_OP='INSERT' then
  new.review_status:='pending';new.is_published:=false;new.review_note:='';new.reviewed_by:=null;new.reviewed_at:=null;
  new.archived_at:=null;new.deleted_at:=null;
 elsif (select private.wk_is_moderator()) then
  new.is_published:=(new.review_status='approved' and new.archived_at is null and new.deleted_at is null);
  if new.review_status is distinct from old.review_status then
   new.reviewed_by:=(select auth.uid());new.reviewed_at:=now();
  else
   new.reviewed_by:=old.reviewed_by;new.reviewed_at:=old.reviewed_at;
  end if;
 else
  raise exception 'Only Wingking moderators may review submissions';
 end if;
 return new;
end $fn$;
revoke all on function private.wk_submission_review_gate() from public,anon,authenticated;

create or replace function private.wk_enforce_review()
returns trigger language plpgsql security definer set search_path = ''
as $fn$
begin
 if TG_OP='INSERT' then
  new.review_status:='pending';new.is_published:=false;new.review_note:='';new.reviewed_by:=null;new.reviewed_at:=null;
  new.archived_at:=null;new.deleted_at:=null;
 elsif (select private.wk_is_moderator()) then
  new.is_published:=(new.review_status='approved' and new.archived_at is null and new.deleted_at is null);
  if new.review_status is distinct from old.review_status then
   new.reviewed_by:=(select auth.uid());new.reviewed_at:=now();
  else
   new.reviewed_by:=old.reviewed_by;new.reviewed_at:=old.reviewed_at;
  end if;
 else
  -- Owners can update their content, but not the moderation or admin archive state.
  new.archived_at:=old.archived_at;new.deleted_at:=old.deleted_at;
  new.review_status:='pending';new.is_published:=false;new.review_note:='';new.reviewed_at:=null;new.reviewed_by:=null;
 end if;
 return new;
end $fn$;
revoke all on function private.wk_enforce_review() from public,anon,authenticated;

-- Defense in depth: unpublished, archived and trashed records cannot leak to readers.
drop policy if exists wk_submissions_public_approved on public.wk_public_submissions;
create policy wk_submissions_public_approved on public.wk_public_submissions
 for select to anon using (review_status='approved' and is_published and archived_at is null and deleted_at is null);
drop policy if exists wk_submissions_moderator_read on public.wk_public_submissions;
create policy wk_submissions_moderator_read on public.wk_public_submissions
 for select to authenticated using ((select private.wk_is_moderator()) or (review_status='approved' and is_published and archived_at is null and deleted_at is null));

drop policy if exists wk_guest_posts_public_read on public.wk_guest_posts;
create policy wk_guest_posts_public_read on public.wk_guest_posts
 for select to anon, authenticated using (is_visible and archived_at is null and deleted_at is null);
drop policy if exists wk_band_public_read on public.wk_bands;
create policy wk_band_public_read on public.wk_bands for select to anon
 using (is_published and review_status='approved' and archived_at is null and deleted_at is null);
drop policy if exists wk_release_public_read on public.wk_releases;
create policy wk_release_public_read on public.wk_releases for select to anon
 using (is_published and review_status='approved' and archived_at is null and deleted_at is null and exists(
  select 1 from public.wk_bands b where b.id=band_id and b.is_published and b.review_status='approved' and b.archived_at is null and b.deleted_at is null
 ));
drop policy if exists wk_clips_read_public on public.wk_clips;
create policy wk_clips_read_public on public.wk_clips for select to anon
 using (is_published and review_status='approved' and archived_at is null and deleted_at is null and exists(
  select 1 from public.wk_bands b where b.id=band_id and b.is_published and b.review_status='approved' and b.archived_at is null and b.deleted_at is null
 ));
