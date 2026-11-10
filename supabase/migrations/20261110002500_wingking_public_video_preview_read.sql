-- 2026-11-10: read previously uploaded preview MP4s on public Studio Sessions cards.
-- Supabase RLS remains enabled and restricts this read to published, active rows.
grant select(video_url) on public.wk_media_links to anon, authenticated;
