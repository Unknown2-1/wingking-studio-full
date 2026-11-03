-- Schema migration imported from user's Wingking Supabase project.
-- Version: 20261102081923
-- Apply using Supabase CLI on a fresh project; do not rerun on live database.

create table if not exists public.wk_clips (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 band_id uuid not null references public.wk_bands(id) on delete cascade,
 title text not null check (char_length(title) between 2 and 80),
 caption text not null default '' check (char_length(caption)<=240),
 video_url text not null check (video_url ~ '^https://[a-z0-9.-]+/storage/v1/object/public/wk-clips/'),
 instagram_url text not null default '' check (char_length(instagram_url)<=350),
 is_published boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists wk_clips_band_time on public.wk_clips(band_id,created_at desc);
create index if not exists wk_clips_public_time on public.wk_clips(created_at desc) where is_published = true;
alter table public.wk_clips enable row level security;
drop policy if exists wk_clips_read_public on public.wk_clips;
create policy wk_clips_read_public on public.wk_clips for select to anon using (is_published and exists (select 1 from public.wk_bands b where b.id=band_id and b.is_published));
drop policy if exists wk_clips_read_owner on public.wk_clips;
create policy wk_clips_read_owner on public.wk_clips for select to authenticated using (owner_id=(select auth.uid()) or (is_published and exists(select 1 from public.wk_bands b where b.id=band_id and b.is_published)));
drop policy if exists wk_clips_insert_owner on public.wk_clips;
create policy wk_clips_insert_owner on public.wk_clips for insert to authenticated with check (
 owner_id=(select auth.uid()) and exists(select 1 from public.wk_bands b where b.id=band_id and b.owner_id=(select auth.uid())));
drop policy if exists wk_clips_update_owner on public.wk_clips;
create policy wk_clips_update_owner on public.wk_clips for update to authenticated
 using(owner_id=(select auth.uid()))
 with check(owner_id=(select auth.uid()) and exists(select 1 from public.wk_bands b where b.id=band_id and b.owner_id=(select auth.uid())));
drop policy if exists wk_clips_delete_owner on public.wk_clips;
create policy wk_clips_delete_owner on public.wk_clips for delete to authenticated using (owner_id=(select auth.uid()));
grant select on public.wk_clips to anon;
grant select,insert,update,delete on public.wk_clips to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('wk-clips','wk-clips',true,36700160,array['video/mp4','video/webm'])
on conflict (id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists wk_clips_storage_owner_insert on storage.objects;
create policy wk_clips_storage_owner_insert on storage.objects for insert to authenticated
with check(bucket_id='wk-clips' and (storage.foldername(name))[1]=(select auth.uid())::text);
drop policy if exists wk_clips_storage_owner_delete on storage.objects;
create policy wk_clips_storage_owner_delete on storage.objects for delete to authenticated
using(bucket_id='wk-clips' and owner_id=(select auth.uid())::text);
drop policy if exists wk_clips_storage_public_read on storage.objects;
create policy wk_clips_storage_public_read on storage.objects for select to anon,authenticated
using (bucket_id='wk-clips');
