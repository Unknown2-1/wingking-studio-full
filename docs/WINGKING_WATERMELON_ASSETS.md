# WINGKING STUDIO — Watermelon Mascot Pack (2026-11-06)

All eight user-supplied watermelon characters were optimized to 750px transparent WebP. These are self-hosted in `apps/live-public/dist/assets/`, which Vite copies as publicDir for `apps/web`.

- watermelon-welcome.webp: Band & Harga and band preview
- watermelon-sparkle.webp: marquee and alternate band fallback
- watermelon-music.webp: Studio Season, Rilisan, release artwork and marquee
- watermelon-gallery.webp: Galeri Studio popup
- watermelon-upload.webp: Upload Band / Video / Rilisan and band fallback
- watermelon-contact.webp: Booking & contact person
- watermelon-ai.webp: ASK WINGKING chat header
- watermelon-success.webp: upload success state

Hero asset `watermelon-hero-transparent.webp` remains unchanged to avoid double stickers.

Source: `apps/web/src/App.jsx`, `apps/web/src/style.css`, `apps/web/src/WingkingAssistant.jsx`, `apps/web/src/wingking-assistant.css`.

Protect existing functionality: no modifications to Supabase, admin routing or business logic; only visual assets and scoped CSS. Test desktop/mobile, loading, popup layouts and error-free build before production deployment.
