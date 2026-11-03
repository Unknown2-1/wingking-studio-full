-- Schema migration imported from user's Wingking Supabase project.
-- Version: 20261103055634
-- Apply using Supabase CLI on a fresh project; do not rerun on live database.

update storage.buckets
set allowed_mime_types = array['image/jpeg','image/png','image/webp','application/pdf','video/mp4','video/webm','video/quicktime']::text[]
where id='wk-guest-private';
update storage.buckets
set allowed_mime_types = array['video/mp4','video/webm','video/quicktime']::text[]
where id='wk-clips';
