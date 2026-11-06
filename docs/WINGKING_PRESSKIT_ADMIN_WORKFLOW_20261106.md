# WINGKING STUDIO — Rollout Form Band & Harga / Press Kit
Updated: 6 November 2026

## Publik
- Band & Harga: **only 3 items**: verified email (Supabase OTP), band name (2–80 chars), Press Kit PDF / DOC / DOCX (up to 10 MB).
- File is kept in the private Supabase storage bucket \`wk-presskit-private\`.
- Admin approves/rejects the application. Only approved, published, non-archived Press Kit cards are visible.
- Download uses an **ephemeral signed URL**, after checking the record is approved.
- Releases: search and visit admin-curated YouTube / Instagram / Spotify links. No public upload.
- Studio Sessions: admin-curated YouTube / Instagram URL-based link cards; no required video title.
- Gallery: view-only for visitors; public photo upload removed.

## Admin Hub
- **Press Kit Band** menu has review, file download, rename, approve/reject, archive/restore, trash/purge.
- **Kelola Video** / **Rilisan Musik**: **Tambah Link** form. A video needs only URL; a release needs band name and URL.
- **Galeri Studio**: direct upload and management remains.
- Legacy guest and gallery public upload functions return 410/403. Existing review/history entries are retained.

## Supabase functions
- \`wingking-presskit\` — verified user public prepare/finish/status, approved download; authenticated moderator review and maintenance.
- \`wingking-media-links\` — authenticated moderator-only URL CRUD.
- Legacy endpoints narrowed: \`wingking-public-intake\`, \`wingking-guest-submissions\`, \`wingking-gallery\`.
- Migration: \`20261106090000_wingking_band_presskit_admin_media_links.sql\`.

## Safety & validation
- Server checks the MIME/extension and **file signature** after upload before submitting for review.
- Unapproved files are never public; service-role secrets are never exposed client-side.
- Signed upload tokens are scoped to unique paths; no direct public object policies in the private bucket.
- User registration capped to 5 submissions per 24 hours.
- Moderator access checked server-side using \`wk_moderators\`.
- The sender \`studiowingkinghub@gmail.com\` must be configured in Supabase Custom SMTP; not part of the repository.

## Testing before acceptance
1. Build React website and admin dashboard.
2. Fresh incognito window: verify video/release/gallery public upload buttons are gone.
3. Sign in with a fresh OTP (requires external Gmail SMTP setup), upload PDF and DOCX, confirm status Pending.
4. Login admin: preview/download, reject with note, then approve; inspect public catalog and download.
5. Archive/restore/trash/purge; confirm that deleted records cannot generate public signed URLs.
6. Add a YouTube video link and Spotify release link in admin and verify both appear publicly.
7. On iPhone: check form readability, scrolling, session persistence, and signed upload.
