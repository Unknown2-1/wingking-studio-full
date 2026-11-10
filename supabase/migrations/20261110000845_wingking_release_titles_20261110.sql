-- Applied to the active Wingking Supabase project (kiuhzrowbypovoydymam).
-- Separate human-entered song/release titles from band names.
-- Legacy entries remain in the database; update the title from the admin panel.
alter table public.wk_media_links
  add column if not exists title text not null default '';

alter table public.wk_media_links
  add constraint wk_media_links_title_length check (char_length(title) <= 100);

grant select(title) on public.wk_media_links to anon, authenticated;

comment on column public.wk_media_links.title is
  'Human-entered song or release title; separate from band_name. Existing legacy rows may be blank.';
