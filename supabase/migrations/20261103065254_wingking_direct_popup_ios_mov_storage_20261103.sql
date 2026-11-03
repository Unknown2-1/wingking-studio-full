-- Schema migration imported from user's Wingking Supabase project.
-- Version: 20261103065254
-- Apply using Supabase CLI on a fresh project; do not rerun on live database.

update storage.buckets set allowed_mime_types=array_append(allowed_mime_types,'video/quicktime') where id='wk-public-intake' and not ('video/quicktime'=any(allowed_mime_types));
