# Wingking Studio — synced deployed source

This directory separates the actual DEPLOYED applications from the pre-existing Next.js repository root:

- `wingking-public/src/`: current public Vercel website (`v27.html`, motion override, Chamber fix, booking UI, and public serverless API sources).
- `wingking-admin/src/`: complete Next.js admin deployment source (`app`, `lib`, `components`, `prisma`, `scripts`, `tests`, assets, build config) from Vercel deployment `dpl_BQqTM4Qs4nTVPD7aT5Zxe8DRnH3n`, plus the live show/hide password feature.
- `wingking-edge/functions/wingking-core/index.ts`: active Supabase Edge Function, version 5, without environment variables or secrets.

These projects have separate Vercel deployment settings and should NOT be merged into the repo root indiscriminately. To deploy independently, configure each project's root directory and required environment variables on Vercel/Supabase. No `.env`, keys, admin passwords, database rows, or live credentials are committed.

Source check: the full admin archive has 56 entries, including `/admin/security` and `/admin/change-password`. Public and Supabase code are as served on October 29, 2026. The live database itself is deliberately NOT exported to GitHub.

IMPORTANT: Passing source synchronization does not certify every business flow. Test admin password rotation, booking, and payment before real-world production operation.