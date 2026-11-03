-- Schema migration imported from user's Wingking Supabase project.
-- Version: 20261102012829
-- Apply using Supabase CLI on a fresh project; do not rerun on live database.

drop policy if exists wk_band_public_read on public.wk_bands;
drop policy if exists wk_band_owner_read on public.wk_bands;
create policy wk_band_public_read on public.wk_bands for select to anon using (is_published = true);
create policy wk_band_owner_read on public.wk_bands for select to authenticated using(is_published = true or owner_id = (select auth.uid()));
drop policy if exists wk_release_public_read on public.wk_releases;
drop policy if exists wk_release_owner_read on public.wk_releases;
create policy wk_release_public_read on public.wk_releases for select to anon using(is_published = true and exists(select 1 from public.wk_bands b where b.id = band_id and b.is_published));
create policy wk_release_owner_read on public.wk_releases for select to authenticated using(owner_id = (select auth.uid()) or (is_published = true and exists(select 1 from public.wk_bands b where b.id = band_id and b.is_published)));
create index if not exists wk_releases_owner_idx on public.wk_releases(owner_id);
