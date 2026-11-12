alter table public.wk_presskits
 add column if not exists photo_path text,
 add column if not exists photo_mime_type text,
 add column if not exists photo_size integer;

alter table public.wk_presskits
 drop constraint if exists wk_presskits_photo_metadata_check,
 add constraint wk_presskits_photo_metadata_check check (
  (photo_path is null and photo_mime_type is null and photo_size is null)
  or (
   photo_path like 'presskits/%'
   and photo_path not like '%..%'
   and photo_mime_type in ('image/jpeg','image/png','image/webp')
   and photo_size between 1 and 5242880
  )
 );

update storage.buckets
set allowed_mime_types = array[
 'application/pdf',
 'application/msword',
 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 'image/jpeg',
 'image/png',
 'image/webp'
]
where id = 'wk-presskit-private';
