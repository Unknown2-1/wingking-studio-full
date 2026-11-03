-- Schema migration imported from user's Wingking Supabase project.
-- Version: 20261102012629
-- Apply using Supabase CLI on a fresh project; do not rerun on live database.

-- isolated Bandspace tables; legacy Service and Booking unaffected
create table if not exists public.wk_bands (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null unique references auth.users(id) on delete cascade,
 name text not null check (char_length(name) between 2 and 80),
 genre text not null default 'Musik',
 city text not null default 'Purwokerto',
 tagline text not null default '' check (char_length(tagline)<=180),
 story text not null default '' check(char_length(story)<=1200),
 accent text not null default '#F8CA45' check(accent ~ '^#[0-9A-Fa-f]{6}$'),
 rate_cards jsonb not null default '[]'::jsonb check(jsonb_typeof(rate_cards)='array' and jsonb_array_length(rate_cards)<=7),
 instagram_url text not null default '' check(char_length(instagram_url)<=350),
 spotify_url text not null default '' check(char_length(spotify_url)<=350),
 photo_url text not null default '' check(char_length(photo_url)<=600),
 is_published boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.wk_releases (
 id uuid primary key default gen_random_uuid(),
 band_id uuid not null references public.wk_bands(id) on delete cascade,
 owner_id uuid not null references auth.users(id) on delete cascade,
 title text not null check(char_length(title) between 1 and 100),
 kind text not null default 'Single' check(kind in ('Single','EP','Album','Live Session')),
 caption text not null default '' check(char_length(caption)<=300),
 cover_url text not null default '' check(char_length(cover_url)<=600),
 listen_url text not null default '' check(char_length(listen_url)<=350),
 is_published boolean not null default true,
 created_at timestamptz not null default now()
);
create index if not exists wk_releases_date_idx on public.wk_releases(created_at desc);
create index if not exists wk_releases_band_idx on public.wk_releases(band_id);
alter table public.wk_bands enable row level security;
alter table public.wk_releases enable row level security;
create policy wk_band_public_read on public.wk_bands for select to anon,authenticated using(is_published=true);
create policy wk_band_owner_read on public.wk_bands for select to authenticated using(owner_id=(select auth.uid()));
create policy wk_band_owner_insert on public.wk_bands for insert to authenticated with check(owner_id=(select auth.uid()));
create policy wk_band_owner_update on public.wk_bands for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy wk_band_owner_delete on public.wk_bands for delete to authenticated using(owner_id=(select auth.uid()));
create policy wk_release_public_read on public.wk_releases for select to anon,authenticated using(is_published=true and exists(select 1 from public.wk_bands b where b.id=band_id and b.is_published));
create policy wk_release_owner_read on public.wk_releases for select to authenticated using(owner_id=(select auth.uid()));
create policy wk_release_owner_insert on public.wk_releases for insert to authenticated with check(owner_id=(select auth.uid()) and exists(select 1 from public.wk_bands b where b.id=band_id and b.owner_id=(select auth.uid())));
create policy wk_release_owner_update on public.wk_releases for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()) and exists(select 1 from public.wk_bands b where b.id=band_id and b.owner_id=(select auth.uid())));
create policy wk_release_owner_delete on public.wk_releases for delete to authenticated using(owner_id=(select auth.uid()));
grant select on public.wk_bands, public.wk_releases to anon;
grant select,insert,update,delete on public.wk_bands,public.wk_releases to authenticated;
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types) values('wk-band-assets','wk-band-assets',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy wk_band_images_public_read on storage.objects for select to anon,authenticated using(bucket_id='wk-band-assets');
create policy wk_band_images_owner_insert on storage.objects for insert to authenticated with check(bucket_id='wk-band-assets' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy wk_band_images_owner_delete on storage.objects for delete to authenticated using(bucket_id='wk-band-assets' and owner_id=(select auth.uid())::text);
