-- Schema migration imported from user's Wingking Supabase project.
-- Version: 20261103001046
-- Apply using Supabase CLI on a fresh project; do not rerun on live database.

alter table public.wk_guest_posts add column if not exists is_visible boolean not null default false;
drop policy if exists wk_guest_posts_public_read on public.wk_guest_posts;
create policy wk_guest_posts_public_read on public.wk_guest_posts for select to anon,authenticated using(is_visible);
create index if not exists wk_guest_posts_visible on public.wk_guest_posts(created_at desc) where is_visible;
