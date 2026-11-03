-- Schema migration imported from user's Wingking Supabase project.
-- Version: 20261103013404
-- Apply using Supabase CLI on a fresh project; do not rerun on live database.

create table if not exists public.wk_public_submissions (
 id uuid primary key default gen_random_uuid(),
 receipt_hash text not null unique,
 kind text not null check(kind in ('band','release','video')),
 band_name text not null check(char_length(band_name) between 2 and 80),
 title text not null default '' check(char_length(title)<=100),
 genre text not null default '' check(char_length(genre)<=60),
 city text not null default '' check(char_length(city)<=70),
 description text not null default '' check(char_length(description)<=1200),
 instagram_url text not null default '' check(char_length(instagram_url)<=350),
 music_url text not null default '' check(char_length(music_url)<=350),
 price_text text not null default '' check(char_length(price_text)<=600),
 photo_url text not null default '' check(char_length(photo_url)<=650),
 video_url text not null default '' check(char_length(video_url)<=650),
 review_status text not null default 'pending' check(review_status in ('pending','approved','rejected')),
 review_note text not null default '' check(char_length(review_note)<=500),
 is_published boolean not null default false,
 submitted_at timestamptz not null default now(),
 reviewed_at timestamptz,
 reviewed_by uuid references auth.users(id)
);
create index if not exists wk_public_submissions_review_idx on public.wk_public_submissions(review_status,submitted_at desc);
alter table public.wk_public_submissions enable row level security;
revoke all on public.wk_public_submissions from public,anon,authenticated;
grant select on public.wk_public_submissions to anon;
grant select,update on public.wk_public_submissions to authenticated;
create policy wk_submissions_public_approved on public.wk_public_submissions for select to anon using(review_status='approved' and is_published);
create policy wk_submissions_moderator_read on public.wk_public_submissions for select to authenticated using((select private.wk_is_moderator()) or (review_status='approved' and is_published));
create policy wk_submissions_moderator_update on public.wk_public_submissions for update to authenticated using((select private.wk_is_moderator())) with check((select private.wk_is_moderator()));
create or replace function private.wk_submission_review_gate() returns trigger language plpgsql set search_path='' as $$
begin
 if TG_OP='INSERT' then
  new.review_status='pending';new.is_published=false;new.review_note='';new.reviewed_by=null;new.reviewed_at=null;
 elsif (select private.wk_is_moderator()) then
  new.is_published=(new.review_status='approved');new.reviewed_by=(select auth.uid());new.reviewed_at=now();
 else
  raise exception 'Only Wingking moderators may review submissions';
 end if;
 return new;
end $$;
revoke all on function private.wk_submission_review_gate() from public,anon,authenticated;
create trigger wk_public_submissions_review_gate before insert or update on public.wk_public_submissions for each row execute function private.wk_submission_review_gate();

create table if not exists public.wk_intake_tickets (
 id uuid primary key default gen_random_uuid(),
 request_key_hash text not null,
 ip_hash text not null,
 path text not null unique,
 file_kind text not null check(file_kind in ('image','video')),
 file_size integer not null check(file_size between 1 and 36700160),
 mime text not null,
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default (now()+interval '1 hour'),
 used_at timestamptz
);
create index if not exists wk_intake_tickets_ip_idx on public.wk_intake_tickets(ip_hash,created_at desc);
alter table public.wk_intake_tickets enable row level security;
revoke all on public.wk_intake_tickets from public,anon,authenticated;

create table if not exists public.wk_intake_events (
 id bigint generated always as identity primary key,
 ip_hash text not null,
 action text not null check(action in ('prepare','submit')),
 occurred_at timestamptz not null default now()
);
create index if not exists wk_intake_events_ip_idx on public.wk_intake_events(ip_hash,action,occurred_at desc);
alter table public.wk_intake_events enable row level security;
revoke all on public.wk_intake_events from public,anon,authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('wk-public-intake','wk-public-intake',true,36700160,array['image/jpeg','image/png','image/webp','video/mp4','video/webm'])
on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
-- Signed upload tokens allow uploads without exposing permanent write access to anonymous users.
