-- Schema migration imported from user's Wingking Supabase project.
-- Version: 20261103000959
-- Apply using Supabase CLI on a fresh project; do not rerun on live database.

create table if not exists public.wk_guest_requests (
 id uuid primary key default gen_random_uuid(),
 receipt_hash text not null unique, ip_hash text not null,
 status text not null default 'draft' check(status in ('draft','pending','approved','rejected')),
 payload jsonb not null default '{}'::jsonb, assets jsonb not null default '{}'::jsonb,
 review_note text not null default '' check(char_length(review_note)<=500),
 reviewed_by uuid references auth.users(id),
 submitted_at timestamptz, reviewed_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists wk_guest_requests_queue on public.wk_guest_requests(status,created_at desc);
create index if not exists wk_guest_requests_ip on public.wk_guest_requests(ip_hash,created_at desc);
alter table public.wk_guest_requests enable row level security;
revoke all on public.wk_guest_requests from public,anon,authenticated;
grant select on public.wk_guest_requests to authenticated;
drop policy if exists wk_guest_requests_moderator_read on public.wk_guest_requests;
create policy wk_guest_requests_moderator_read on public.wk_guest_requests for select to authenticated using ((select private.wk_is_moderator()));
create table if not exists public.wk_guest_posts (
 id uuid primary key references public.wk_guest_requests(id) on delete cascade,
 name text not null check(char_length(name) between 2 and 80),
 genre text not null default 'Musik',city text not null default 'Purwokerto',
 tagline text not null default '',story text not null default '',
 accent text not null default '#f7ca4f',rate_cards jsonb not null default '[]'::jsonb,
 instagram_url text not null default '',spotify_url text not null default '',
 photo_url text not null default '',price_image_url text not null default '',
 release_title text not null default '',release_kind text not null default 'Single',
 release_caption text not null default '',release_listen_url text not null default '',
 release_cover_url text not null default '',clip_title text not null default '',
 clip_caption text not null default '',clip_url text not null default '',
 clip_instagram_url text not null default '',created_at timestamptz not null default now()
);
alter table public.wk_guest_posts enable row level security;
revoke all on public.wk_guest_posts from public,anon,authenticated;
grant select on public.wk_guest_posts to anon,authenticated;
drop policy if exists wk_guest_posts_public_read on public.wk_guest_posts;
create policy wk_guest_posts_public_read on public.wk_guest_posts for select to anon,authenticated using(true);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('wk-guest-private','wk-guest-private',false,36700160,array['image/jpeg','image/png','image/webp','application/pdf','video/mp4','video/webm'])
on conflict(id) do update set public=false,file_size_limit=36700160,allowed_mime_types=excluded.allowed_mime_types;
