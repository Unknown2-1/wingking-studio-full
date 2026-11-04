# Code provenance and readiness

As of 2026-11-04:

| Directory | Source | Completeness |
|---|---|---|
| `apps/web/` | React/Vite frontend reconstructed from public production build | Editable `src/App.jsx`, `src/style.css`, `src/upload.js`, `upload.html`; CI Vite build succeeds; **not original source JSX** |
| `apps/admin-unified/index.html` | Consolidated from recovered Content Manager preview and existing admin queue endpoints | Editable standalone HTML/JS; original guest review + content CRUD under one login; **must test on authorized host** |
| `legacy-nextjs/` | `Epan0310/wingking-studio`, merged Oct 29 source, development branch `dev/unknown2-1` | All relevant original text source copied; third-party editor skill duplicates and binary icon excluded |
| `apps/live-public/dist/` | `https://wingking-studio.vercel.app/`, live Vite/React build | Actual HTML, JS bundles, CSS, WebP art, upload scripts and logo; **compiled build**, not latest editable React JSX |
| `apps/live-public/source/` | Selected untruncated Vercel deployment source files | Partial Vite config/helpers; large original `main.jsx` was not retrievable in full |
| `apps/private-review/dist/` | `https://wingking-private-review-console.vercel.app/` | Actual deployed HTML/JS/CSS/logo and activation page; JS is **compiled build** |
| `apps/private-review/source/` | Selected untruncated Vercel deployment source files | Partial source; large original `src/main.jsx` was not retrievable in full |
| `apps/content-manager/index.html` | `https://wingking-content-manager-preview.vercel.app/` | Standalone HTML/CSS/JS current preview; editable |
| `supabase/functions/` | Active Supabase source | Four main live Edge Functions as of Nov 3, excluding sensitive one-time bootstrap and internal QA helpers |
| `supabase/migrations/` | Supabase migration history (schema SQL, not data) | 13 non-sensitive migrations; 4 one-time bootstrap/pg_net helper migrations intentionally excluded |
| `supabase/types/` | Supabase generated TypeScript types | Generated database types |

## Limitations and safety

- Latest public Vercel React JSX and separate review dashboard JSX could not be fully retrieved from file APIs. The production bundles are preserved to allow serving the live look/flow; Use the new `apps/web` reconstructed React source for website changes. For major refactors, original Vite source from the previous developer would still be valuable.
- Source snapshot is **not** a verified one-click clean-room production redeployment. Vercel root directories, environment variables, Supabase project configuration, storage policies, runtime permissions, and user credentials must be configured and tested.
- Static JS bundles embed a **publishable** Supabase key and project URL. **Local UI operations may still touch the LIVE Supabase database.** Do not test approve/delete using customer content. Clone the backend into a staging Supabase project and rebuild the Vite source before local QA.
- **No secrets, database rows, private uploaded files, real user video contents, private auth records, or admin passwords** are included.
- `wingking-admin-provision-once` and internal QA storage-cleanup functions are deliberately NOT copied; do not deploy such temporary administrative functions to public-facing projects.
- The GitHub repository is PUBLIC as created by its owner. Use a PRIVATE repository if the project source should be team-only.

## Admin consolidation (2026-11-03)

`apps/admin-unified/index.html` provides a single moderator sign-in, a review queue for pending guest/public submissions, plus video, band, release, archive, trash and audit views. It calls the existing live `wingking-guest-submissions` and `wingking-content-manager` Edge Functions and relies on their JWT/moderator checks. The old separate admin apps remain as rollback artifacts. CORS only allows the existing review-console production host (and the old Content Manager preview for its own functions); new staging hostnames need backend CORS configuration before end-to-end login testing. Static JS syntax is verified, but iPhone and live authenticated operations are not validated automatically.

## Unified admin deployment status

On 2026-11-03, the Admin Hub in `apps/admin-unified/index.html` was deployed to `https://wingking-private-review-console.vercel.app/` on the existing production Vercel project (`dpl_CEAPNeZ1JSrUPfX5P1YEBCweRtzV`, READY). The old Content Manager preview URL was replaced with a redirect to the unified admin (`dpl_BJqh21tcRNX7R5fNMFmLUM7gSofr`, READY). Frontend script syntax and preview HTTP 200 were checked. No test credentials were used; authenticated review, password rotation, media upload, and mobile interactions require end-to-end QA with a safe test account and staged content. Supabase function code and production data were not modified by this consolidation.

## Source recovery for team — 2026-11-04

Restored a Vite multi-page project in `apps/web/` from the production JavaScript and CSS snapshots. Components have meaningful names such as `HomePage`, `BandCard`, `VideoCard`, `UploadBandModal`, while older internal variable names remain. Added a dedicated editable upload page and script, local demo/staging configuration, and a GitHub Actions build check. CI reported successful builds; visual parity and authenticated mobile uploads still require manual QA. See [WHERE_TO_EDIT](WHERE_TO_EDIT.md) for the file and feature map.
