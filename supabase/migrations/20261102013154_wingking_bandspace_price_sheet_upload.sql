-- Schema migration imported from user's Wingking Supabase project.
-- Version: 20261102013154
-- Apply using Supabase CLI on a fresh project; do not rerun on live database.

alter table public.wk_bands add column if not exists price_image_url text not null default ''; alter table public.wk_bands drop constraint if exists wk_bands_price_image_url_length; alter table public.wk_bands add constraint wk_bands_price_image_url_length check(char_length(price_image_url)<=600); update storage.buckets set allowed_mime_types=array['image/jpeg','image/png','image/webp','application/pdf'] where id='wk-band-assets';
