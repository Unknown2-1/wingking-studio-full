# WINGKING STUDIO — TEAM DEVELOPMENT

> **Mulai dari sini untuk edit website.** Website publik versi terbaru kini memiliki workspace React/Vite di `apps/web/`. Kode komponen dipulihkan secara fungsional dari bundle produksi; penamaan komponen masih perlu dirapikan. Dashboard admin gabungan memakai `apps/admin-unified/`, sementara backend dan database berada di `supabase/`.

## Teknologi yang dipakai

| Bagian | Teknologi | Folder |
| --- | --- | --- |
| Frontend publik | React 19, Vite 6, JavaScript/JSX, CSS | `apps/web/src/` dan `apps/web/upload.html` |
| Dashboard admin | HTML/CSS/JS, Supabase Auth | `apps/admin-unified/` |
| Backend API | Supabase Edge Functions (Deno/TypeScript) | `supabase/functions/` |
| Database | PostgreSQL, Supabase Storage, RLS | `supabase/migrations/` |
| Website Next.js lama | Next.js + Prisma (arsip versi terdahulu) | `legacy-nextjs/` |
| Backup deployment lama | Snapshot build JS/CSS dan aset gambar | `apps/live-public/dist/` |

## Jalankan di VS Code

```bash
git clone https://github.com/Unknown2-1/wingking-studio-full.git
cd wingking-studio-full
cd apps/web
npm install
npm run dev
```

Buka `http://localhost:3000`. Kamu bisa mengubah `apps/web/src/App.jsx`, `apps/web/src/style.css`, dan upload di `apps/web/src/upload.js` / `apps/web/upload.html`.

Di terminal lain, kembali ke root repo dan jalankan `npm run dev:admin` untuk dashboard di `http://localhost:3001`. **Tidak perlu menggunakan akun produksi saat mencoba perubahan.**

**Production assets:** Untuk menjaga kesamaan desain, Vite memakai gambar dan halaman upload yang tersimpan pada `apps/live-public/dist/`. Jangan hapus folder itu sebelum seluruh aset dipindahkan. `apps/web/dist/` akan dibuat otomatis ketika `npm run build` dan diabaikan Git.

## Konfigurasi & keamanan

Salin `apps/web/.env.example` menjadi `apps/web/.env.local`. Biarkan key kosong untuk mode demo. Untuk menguji upload dan database, gunakan **staging Supabase**. Jangan masukkan service-role keys atau password admin ke repository public.

Lihat [panduan frontend](apps/web/README.md), [team setup](docs/TEAM_SETUP.md), [status yang belum selesai](docs/STATUS.md), dan [keamanan](docs/SECURITY.md).

---

## Snapshot dan dokumentasi sebelumnya

**Full team repository — editable unified Admin Hub, preserved original snapshots, public website and Supabase backend.**

[Live website](https://wingking-studio.vercel.app/) · [Private review](https://wingking-private-review-console.vercel.app/) · [Content Manager preview](https://wingking-content-manager-preview.vercel.app/)

## What's included

| Directory | What's inside |
|---|---|
| `apps/admin-unified/index.html` | **Editable single-login Admin Hub** combining guest/public review queue with content management; deployed to the existing private review alias (runtime authenticated QA pending) |
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

npm run dev:public:snapshot   # localhost:3000 (historical static deploy)
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

The original separate admin snapshots are retained for historical reference. `npm run dev:review:legacy` and `npm run dev:manager:legacy` run those old snapshots on ports 3003 and 3002. The unified Admin Hub is live at https://wingking-private-review-console.vercel.app/. The former https://wingking-content-manager-preview.vercel.app/ now redirects there. The original compiled admin snapshots are still in this repository for reference or rollback.

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
