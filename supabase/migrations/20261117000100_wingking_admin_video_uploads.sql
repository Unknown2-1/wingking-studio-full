alter table public.wk_media_links
 add column if not exists video_path text;

alter table public.wk_media_links
 alter column link_url set default '',
 drop constraint if exists wk_media_links_link_url_check,
 add constraint wk_media_links_link_url_check check (
  char_length(link_url)<=500
  and (link_url='' or link_url ~ '^https://[^[:space:]]+$')
 );

alter table public.wk_media_links
 drop constraint if exists wk_media_links_platform_check,
 add constraint wk_media_links_platform_check check (
  platform in ('YouTube','Instagram','Spotify','Lainnya')
 );

alter table public.wk_media_links
 drop constraint if exists wk_media_links_video_path_check,
 add constraint wk_media_links_video_path_check check (
  video_path is null
  or (
   video_path like 'admin/%'
   and video_path not like '%..%'
   and video_path ~ '^admin/[0-9a-f-]{36}/[0-9a-f-]{36}\.(mp4|webm)$'
  )
 );

create unique index if not exists wk_media_links_video_path_unique
 on public.wk_media_links(video_path)
 where video_path is not null;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('wk-clips','wk-clips',true,37748736,array['video/mp4','video/webm'])
on conflict (id) do update set
 public=true,
 file_size_limit=excluded.file_size_limit,
 allowed_mime_types=excluded.allowed_mime_types;
