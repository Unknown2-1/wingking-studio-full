-- 2026-11-06: WINGKING STUDIO / private photo intake and moderated public gallery
create table if not exists public.wk_gallery_photos (
 id uuid primary key default gen_random_uuid(),
 title text not null check (char_length(title) between 2 and 100),
 caption text not null default '' check (char_length(caption)<=500),
 image_url text not null default '',
 pending_path text not null default '',
 public_path text not null default '',
 file_mime text not null default 'image/jpeg'
   check (file_mime in ('image/jpeg','image/png','image/webp')),
 review_status text not null default 'uploading'
   check (review_status in ('uploading','pending','approved','rejected')),
 is_published boolean not null default false,
 is_admin_upload boolean not null default false,
 submitted_by uuid references auth.users(id) on delete set null,
 reviewed_by uuid references auth.users(id) on delete set null,
 review_note text not null default '' check (char_length(review_note)<=500),
 created_at timestamptz not null default now(),
 submitted_at timestamptz,
 reviewed_at timestamptz,
 updated_at timestamptz not null default now(),
 archived_at timestamptz,
 deleted_at timestamptz,
 display_order integer not null default 1000,
 legacy_key text unique,
 constraint wk_gallery_publish_guard check (not is_published or review_status='approved')
);
create index if not exists wk_gallery_public_idx on public.wk_gallery_photos (display_order,created_at desc)
 where review_status='approved' and is_published and archived_at is null and deleted_at is null;
create index if not exists wk_gallery_review_idx on public.wk_gallery_photos (review_status,created_at desc);
create index if not exists wk_gallery_owner_idx on public.wk_gallery_photos (submitted_by,created_at desc);
alter table public.wk_gallery_photos enable row level security;
revoke all on public.wk_gallery_photos from public,anon,authenticated;
grant select (id,title,caption,image_url,created_at,display_order) on public.wk_gallery_photos to anon,authenticated;
grant all on public.wk_gallery_photos to service_role;
drop policy if exists wk_gallery_public_approved on public.wk_gallery_photos;
create policy wk_gallery_public_approved on public.wk_gallery_photos for select to anon,authenticated
 using (review_status='approved' and is_published and archived_at is null and deleted_at is null and image_url<>'');
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values
 ('wk-gallery-pending','wk-gallery-pending',false,5242880,array['image/jpeg','image/png','image/webp']),
 ('wk-gallery-public','wk-gallery-public',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,
 allowed_mime_types=excluded.allowed_mime_types;
-- Only signed-upload tokens allow writes into the private bucket.
alter table public.wk_content_activity drop constraint if exists wk_content_activity_source_check;
alter table public.wk_content_activity add constraint wk_content_activity_source_check
 check (source in ('public','band','release','clip','guest','gallery'));
-- Backfill legacy gallery into database metadata. Existing JPG files remain in
-- publicly deployed static assets so prior 12 gallery images continue to load.
insert into public.wk_gallery_photos
 (title,caption,image_url,file_mime,review_status,is_published,review_note,reviewed_at,submitted_at,display_order,legacy_key)
select 'Suasana Studio '||lpad(g.n::text,2,'0'),'Dokumentasi WINGKING HUB STUDIO',
 'https://wingking-studio.vercel.app/assets/studio-gallery/studio-'||lpad(g.n::text,2,'0')||'.jpg',
 'image/jpeg','approved',true,'Foto galeri lama',now(),now(),
 g.n,'studio-'||lpad(g.n::text,2,'0')
from generate_series(1,12) g(n) on conflict (legacy_key) do nothing;
