# WINGKING STUDIO — Rollout Form Band & Harga / Press Kit
Updated: 17 November 2026

## Publik
- Band & Harga: **only 3 items**: verified email (Supabase OTP), band name (2–80 chars), Press Kit PDF / DOC / DOCX (up to 10 MB).
- File is kept in the private Supabase storage bucket \`wk-presskit-private\`.
- Admin approves/rejects the application. Only approved, published, non-archived Press Kit cards are visible.
- Download uses an **ephemeral signed URL**, after checking the record is approved.
- Releases: search and visit admin-curated YouTube / Instagram / Spotify links. No public upload.
- Studio Sessions: admin-uploaded MP4/WebM videos (up to 36 MB) with an optional HTTPS destination link. Existing URL-based cards remain supported.
- Gallery: view-only for visitors; public photo upload removed.

## Admin Hub
- **Press Kit Band** menu has review, file download, rename, approve/reject, archive/restore, trash/purge.
- **Kelola Video**: **Tambah Video** uploads the video file and optionally accepts any HTTPS destination link. No title is required; untitled videos use the default “Studio Sessions” label on the website. Uploads use a signed URL to the public `wk-clips` bucket; only authenticated moderators can request upload tokens.
- **Rilisan Musik**: existing link-based form for a release title, band name, and supported music link.
- **Galeri Studio**: direct upload and management remains.
- Legacy guest and gallery public upload functions return 410/403. Existing review/history entries are retained.

## Supabase functions
- \`wingking-presskit\` — verified user public prepare/finish/status, approved download; authenticated moderator review and maintenance.
- \`wingking-media-links\` — authenticated moderator-only video upload, URL CRUD, and media lifecycle actions.
- Legacy endpoints narrowed: \`wingking-public-intake\`, \`wingking-guest-submissions\`, \`wingking-gallery\`.
- Migrations: \`20261106090000_wingking_band_presskit_admin_media_links.sql\`, \`20261117000100_wingking_admin_video_uploads.sql\`.

## Safety & validation
- Server checks the video MIME/extension and **file signature** after admin upload; Press Kit and visitor-submitted files remain private until approved.
- Admin-managed Studio Sessions videos are intentionally readable from the public bucket after submission; service-role secrets are never exposed client-side.
- Signed upload tokens are scoped to unique paths; public video files are readable from the existing \`wk-clips\` bucket after an admin submits the upload.
- User registration capped to 5 submissions per 24 hours.
- Moderator access checked server-side using \`wk_moderators\`.
- The sender \`studiowingkinghub@gmail.com\` must be configured in Supabase Custom SMTP; not part of the repository.

## Testing before acceptance
1. Build React website and admin dashboard.
2. Fresh incognito window: verify video/release/gallery public upload buttons are gone.
3. Sign in with a fresh OTP (requires external Gmail SMTP setup), upload PDF and DOCX, confirm status Pending.
4. Login admin: preview/download, reject with note, then approve; inspect public catalog and download.
5. Archive/restore/trash/purge; confirm that deleted records cannot generate public signed URLs.
6. Upload an MP4/WebM video with and without a destination link; verify the default label, playback, sound control, and optional outbound link on the public Studio Sessions cards.
7. Add a Spotify release link in admin and verify it appears publicly.
8. On iPhone: check form readability, scrolling, session persistence, and signed upload.

## Admin video upload rollout
1. Apply \`20261117000100_wingking_admin_video_uploads.sql\` to the active Supabase project.
2. Deploy the updated \`wingking-media-links\` Edge Function.
3. Deploy the Admin Hub and website changes.
4. Upload an MP4 and a WebM under 36 MB; verify the video appears in Studio Sessions, optional HTTPS links open correctly, and permanent deletion removes the uploaded object.
