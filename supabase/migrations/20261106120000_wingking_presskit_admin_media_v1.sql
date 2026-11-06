-- WINGKING STUDIO • 2026-11-06 • minimal band Press Kit and moderator-curated media
-- Idempotent deployment script. Live database was updated with equivalent SQL.
create table if not exists public.wk_presskits(
 id uuid primary key default gen_random_uuid(),
 submitted_by uuid references auth.users(id) on delete set null,
 band_name text not null check(char_length(band_name) between 2 and 80),
 file_path text not null,
 original_filename text not null check(char_length(original_filename) between 1 and 180),
 mime_type text not null check(mime_type in ('application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document')),
 file_size integer not null check(file_size between 1 and 10485760),
 status text not null default 'draft' check(status in ('draft','pending','approved','rejected')),
 is_published boolean not null default false,
 review_note text not null default '' check(char_length(review_note)<=500),
 reviewed_by uuid references auth.users(id) on delete set null,
 reviewed_at timestamptz,submitted_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 archived_at timestamptz,deleted_at timestamptz,
 constraint wk_presskits_public_guard check (not is_published or status='approved'),
 constraint wk_presskits_path_guard check (file_path like 'presskits/%' and file_path not like '%..%')
);
create index if not exists wk_presskits_public_idx on public.wk_presskits(created_at desc)
 where status='approved' and is_published and archived_at is null and deleted_at is null;
create index if not exists wk_presskits_owner_idx on public.wk_presskits(submitted_by,created_at desc);
create index if not exists wk_presskits_admin_idx on public.wk_presskits(status,submitted_at desc);
alter table public.wk_presskits enable row level security;
revoke all on public.wk_presskits from public,anon,authenticated;
grant select(id,band_name,created_at) on public.wk_presskits to anon,authenticated;
grant all on public.wk_presskits to service_role;
drop policy if exists wk_presskits_public on public.wk_presskits;
create policy wk_presskits_public on public.wk_presskits for select to anon,authenticated
 using(status='approved' and is_published and archived_at is null and deleted_at is null);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('wk-presskit-private','wk-presskit-private',false,10485760,
 array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict(id)do update set public=false,file_size_limit=excluded.file_size_limit,
 allowed_mime_types=excluded.allowed_mime_types;
-- Private files: NO anon/authenticated storage.objects access policy for wk-presskit-private.
create table if not exists public.wk_media_links(
 id uuid primary key default gen_random_uuid(),
 kind text not null check(kind in ('video','release')),
 band_name text not null default '' check(char_length(band_name)<=80),
 link_url text not null check(char_length(link_url) between 12 and 500 and link_url like 'https://%'),
 platform text not null check(platform in ('YouTube','Instagram','Spotify')),
 is_published boolean not null default true,
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 archived_at timestamptz,deleted_at timestamptz,
 constraint wk_media_release_name check(kind<>'release' or char_length(band_name) between 2 and 80)
);
create index if not exists wk_media_links_public_idx on public.wk_media_links(kind,created_at desc)
 where is_published and archived_at is null and deleted_at is null;
alter table public.wk_media_links enable row level security;
revoke all on public.wk_media_links from public,anon,authenticated;
grant select(id,kind,band_name,link_url,platform,created_at) on public.wk_media_links to anon,authenticated;
grant all on public.wk_media_links to service_role;
drop policy if exists wk_media_links_public on public.wk_media_links;
create policy wk_media_links_public on public.wk_media_links for select to anon,authenticated
 using(is_published and archived_at is null and deleted_at is null);
alter table public.wk_content_activity drop constraint if exists wk_content_activity_source_check;
alter table public.wk_content_activity add constraint wk_content_activity_source_check
 check(source in ('public','band','release','clip','guest','gallery','presskit','media'));
-- Block old direct self-upload tables and storage. Only service-role admin APIs may write.
drop policy if exists wk_band_owner_insert on public.wk_bands;
drop policy if exists wk_band_owner_update on public.wk_bands;
drop policy if exists wk_band_owner_delete on public.wk_bands;
drop policy if exists wk_clips_insert_owner on public.wk_clips;
drop policy if exists wk_clips_update_owner on public.wk_clips;
drop policy if exists wk_clips_delete_owner on public.wk_clips;
drop policy if exists wk_release_owner_insert on public.wk_releases;
drop policy if exists wk_release_owner_update on public.wk_releases;
drop policy if exists wk_release_owner_delete on public.wk_releases;
revoke insert,update,delete on public.wk_bands from anon,authenticated;
revoke insert,update,delete on public.wk_clips from anon,authenticated;
revoke insert,update,delete on public.wk_releases from anon,authenticated;
drop policy if exists wk_band_images_owner_insert on storage.objects;
drop policy if exists wk_band_images_owner_delete on storage.objects;
drop policy if exists wk_clips_storage_owner_insert on storage.objects;
drop policy if exists wk_clips_storage_owner_delete on storage.objects;
