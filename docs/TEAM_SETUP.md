# Team setup — Wingking Studio

## Get the code

```bash
git clone https://github.com/Unknown2-1/wingking-studio-full.git
cd wingking-studio-full
```

Node.js 20+ and npm are recommended for the legacy Next.js app. The static Vercel snapshots run with the included dependency-free Node server.

## View the live snapshot locally

```bash
npm run dev:public   # localhost:3000 — public festival website
npm run dev:admin    # localhost:3001 — unified review + content management
npm run dev:review   # alias for the same unified Admin Hub
npm run dev:review:legacy  # localhost:3003 — former review snapshot
npm run dev:manager:legacy # localhost:3002 — former content manager snapshot
npm run check:assets
```

Run each site command in a separate terminal. The unified Admin Hub has one login and combines the pending review queue with content management. Existing Supabase Auth JWT and `wk_moderators` membership are required for operations. **Do not use real client data during QA.**

**CAUTION:** static bundles can talk to live Supabase. Do not test delete, publish or reject actions against production data.

## Editable original Next.js source

```bash
cd legacy-nextjs
npm ci
# Configure your own legacy-nextjs/.env (use ../.env.example as a template)
npx prisma generate
npm run dev
```

Legacy Next.js project, live React/Vite website and private review dashboard are three different generations of the project. They are intentionally separated rather than incorrectly merged together.

## Deploy on Vercel

Set each as a different Vercel project with its own Root Directory:

- **Static public snapshot:** `apps/live-public/dist`, Framework Other, no build command.
- **Unified Admin Hub (new):** `apps/admin-unified`, Framework Other, no build command; deployed to existing Wingking review-console production domain. Previous admin snapshots remain in the repository; validate authenticated flows with test data before further rollout. The Supabase Edge Functions have an exact CORS allowlist for that host.
- **Historical review snapshot:** `apps/private-review/dist`, Framework Other, no build command.
- **Historical Content Manager snapshot:** `apps/content-manager`, Framework Other, no build command.
- **Editable legacy Next.js:** `legacy-nextjs`, Framework Next.js, environment variables configured in Vercel.

An actual production release should be tested on **staging** first. Do not attach the current production domain or point tests at the live database until verified.

## Database and Edge Functions

Supabase project reference from existing app: `kiuhzrowbypovoydymam`. The SQL files in `supabase/migrations` represent the original schema; apply only to a fresh/staging project after reviewing the gaps documented in `docs/STATUS.md`. Existing live database already has these migrations — do NOT run them again there.

Use Supabase CLI for function deployment only after configuring credentials outside Git:
```bash
supabase login
supabase link --project-ref YOUR_STAGING_PROJECT_REF
supabase functions deploy wingking-core --no-verify-jwt
supabase functions deploy wingking-public-intake --no-verify-jwt
supabase functions deploy wingking-guest-submissions --no-verify-jwt
supabase functions deploy wingking-content-manager --no-verify-jwt
```
Function handlers must still authenticate and authorize each operation. `--no-verify-jwt` preserves the current deployment mode only; do not treat it as permission to bypass auth.

## Work together

Create a feature branch, open a pull request, review changes, and merge to `main` only after tests pass. Invite collaborators with **Settings → Collaborators → Add people**, choosing their correct GitHub usernames. Public visibility alone permits cloning and viewing, not pushing.

## Live URLs

- Website: https://wingking-studio.vercel.app/
- Original private review: https://wingking-private-review-console.vercel.app/
- Content Manager preview: https://wingking-content-manager-preview.vercel.app/
