# Wingking Studio â€” deployed public frontend snapshot

- Live customer website: https://wingking-studio.vercel.app/
- Admin dashboard: https://wingking-studio-admin.vercel.app/admin
- Git branch: `dev/unknown2-1` (existing `main` and Next.js application unchanged)
- Snapshot generated from the currently live production website on execution.

## What is included

The `src/` folder contains `v27.html` (official branded, responsive, scroll-animated frontend), `booking-live.js`, the official logo-based SVG assets, four public API proxy functions, and Vercel configuration.

## How to deploy this snapshot independently

In Vercel, create or configure a **separate project** with its Root Directory set to `deployments/wingking-public/src`, and Framework Preset `Other`. The source was originally deployed as a standalone Vercel project, **not** as the Next.js app at repository root. It proxies public API requests to the Supabase Edge Function `wingking-core`; the admin interface is a separate deployed service. Verify API availability, booking, and admin login before handing off to the client.

No passwords, database credentials, or Vercel environment secrets are committed. This snapshot does not copy the separate admin Next.js source or Supabase database. Do not commit test credentials. Rotate the admin test password before production handoff.