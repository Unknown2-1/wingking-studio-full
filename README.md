# WINGKING STUDIO

**Full team repository — editable unified Admin Hub, preserved original snapshots, public website and Supabase backend.**

[Live website](https://wingking-studio.vercel.app/) · [Private review](https://wingking-private-review-console.vercel.app/) · [Content Manager preview](https://wingking-content-manager-preview.vercel.app/)

## What's included

| Directory | What's inside |
|---|---|
| `apps/admin-unified/index.html` | **Editable single-login Admin Hub** combining guest/public review queue with content management; deployment candidate pending runtime QA |
| `legacy-nextjs/` | Complete relevant original editable Next.js project source, booking logic, Prisma schema, old admin app, tests and historical releases |
| `apps/live-public/dist/` | New live Vite/React website **production build**, upload interface, JS/CSS bundles, original WebP illustrations, logo |
| `apps/live-public/source/` | Available Vite configuration and helpers (original newest JSX entrypoint could not be fully retrieved) |
| `apps/private-review/dist/` | Latest standalone moderator dashboard **production build**, CSS, logo, admin activation |
| `apps/private-review/source/` | Available original moderator project configuration (latest large JSX file not fully retrievable) |
| `apps/content-manager/` | Standalone editable HTML/CSS/JS Content Manager preview |
| `supabase/functions/` | 4 active Edge Functions: booking/core, anonymous guest submissions, public intake, content management |
| `supabase/migrations/` | 13 non-sensitive SQL schema/migration files, RLS, storage and moderation rules |
| `supabase/types/` | Generated TypeScript database type definitions |
| `docs/` | Team onboarding, deployment, readiness and security guidance |

## Start locally

Requires Node.js 20+.

```bash
git clone https://github.com/Unknown2-1/wingking-studio-full.git
cd wingking-studio-full

npm run dev:public   # http://localhost:3000
npm run dev:admin    # http://localhost:3001 (review + content manager in one login)
npm run dev:review   # same unified Admin Hub, http://localhost:3001
```

Run each command in a separate terminal. These static snapshot viewers require no `npm install`.

For the **editable original Next.js application**:

```bash
cd legacy-nextjs
npm ci
# create .env locally from ../.env.example with your OWN staging credentials
npx prisma generate
npm run dev
```

The original separate admin snapshots are retained for historical reference. `npm run dev:review:legacy` and `npm run dev:manager:legacy` run those old snapshots on ports 3003 and 3002. The live private review alias is not changed until a verified deployment is promoted.

For full instructions, use [TEAM_SETUP](docs/TEAM_SETUP.md), [STATUS](docs/STATUS.md), and [SECURITY](docs/SECURITY.md).

## ⚠️ Important before editing

- This repository is **PUBLIC**, as configured on GitHub. Do not commit secrets, admin passwords, customer records or private uploaded files.
- Some production JS snapshots are wired to the **LIVE Supabase database**. Clicking approve, reject or delete when authenticated can affect real content. Use a staging Supabase project for QA.
- The latest Vercel production builds are backed up **as deployable bundles**, not complete latest editable JSX sources. See `docs/STATUS.md`; the original editable Next.js source is fully preserved separately.
- Never reapply existing SQL migrations to the production database. Migrations that provisioned a one-time administrator are deliberately not included.
- Deployment to Vercel, branch protections, secrets and admin access must be configured by authorized team members.

## Working as a team

Ask the repo owner to add GitHub collaborators via **Settings → Collaborators**. Work on branches and review pull requests before merging to `main`. `dev/unknown2-1` can be used for development work.

Original project attribution: [Epan0310/wingking-studio](https://github.com/Epan0310/wingking-studio) (development branch `dev/unknown2-1`).
