> **SINKRONISASI TIM — 12 November 2026:** Repository resmi adalah `Unknown2-1/wingking-studio-full`. Branch `main` dan `dev/unknown2-1` sudah disejajarkan agar memakai kode website publik yang sama. Source website yang aktif berada di `apps/web/`, **bukan** `apps/live-public/dist/` atau `legacy-nextjs/`. Jika localhost masih menunjukkan data/demo lama, periksa `apps/web/.env.local`. Ikuti [panduan sinkronisasi tim](docs/TEAM_SYNC_LATEST.md).

# WINGKING STUDIO

Website musik lokal: band, rilisan, video, price list, form upload, dan admin moderasi. **Repository ini untuk tim developer.**

## Peta stack dan kode yang aktif

| Bagian | Teknologi | Lokasi |
| --- | --- | --- |
| Frontend website | React 19, Vite 6, CSS, Lucide React | [`apps/web/`](apps/web/) |
| Frontend admin | HTML/CSS/JavaScript, satu login moderator | [`apps/admin-unified/`](apps/admin-unified/) |
| Backend/API | Supabase Edge Functions (Deno + TypeScript) | [`supabase/functions/`](supabase/functions/) |
| Database | Supabase PostgreSQL, RLS, Auth, Storage | [`supabase/migrations/`](supabase/migrations/) |
| Versi Next.js terdahulu | Next.js, Prisma | [`legacy-nextjs/`](legacy-nextjs/) |
| Backup build dan gambar | HTML, JS, CSS, WebP dari website live | [`apps/live-public/dist/`](apps/live-public/dist/) |

**Mulai edit frontend dari `apps/web/`, BUKAN `apps/live-public/dist/` atau `legacy-nextjs/`.**

## Setup untuk yang pertama kali clone

Persyaratan: Node.js 22 dan npm.

```bash
git clone https://github.com/Unknown2-1/wingking-studio-full.git
cd wingking-studio-full
cd apps/web
npm install
npm run dev
```

Buka **http://localhost:3000**. Ubah kode website di `src/App.jsx`, `src/style.css`, `src/upload.js`, dan `upload.html`. Vite menyediakan live reload otomatis.

Tes hasil build sebelum PR:

```bash
npm run build
```

Dashboard admin bisa dibuka di terminal lain dari root repository:

```bash
npm run dev:admin
```

Admin lokal berada di **http://localhost:3001**; operasi yang mengubah konten tetap memerlukan akun moderator berwenang dan backend yang dikonfigurasi.

## Penjelasan folder

```text
wingking-studio-full/
├── apps/
│   ├── web/                  # FRONTEND PUBLIK: React + Vite
│   │   ├── src/
│   │   │   ├── App.jsx       # homepage, kartu band, rilisan, video, modal
│   │   │   ├── main.jsx      # bootstrap React
│   │   │   ├── style.css     # styling
│   │   │   ├── upload.js     # proses upload
│   │   │   └── config.js     # konfigurasi
│   │   ├── upload.html       # halaman upload
│   │   ├── index.html
│   │   └── package.json
│   ├── admin-unified/        # DASHBOARD ADMIN: review + kelola konten
│   ├── live-public/dist/     # BACKUP aset/build produksi lama
│   ├── content-manager/     # BACKUP admin lama
│   └── private-review/      # BACKUP dashboard review lama
├── supabase/
│   ├── functions/            # BACKEND API
│   ├── migrations/           # DATABASE schema/RLS
│   └── types/
├── legacy-nextjs/           # Source generasi sebelumnya (arsip)
├── docs/
└── package.json             # Script tim
```

**Panduan lengkap: [file mana yang harus diedit](docs/WHERE_TO_EDIT.md).**

## Konfigurasi database (wajib untuk integrasi sungguhan)

```bash
cd apps/web
cp .env.example .env.local
```

Di Windows PowerShell: `Copy-Item .env.example .env.local`.

Tanpa konfigurasi, homepage berjalan dalam **mode demo**. Untuk menguji fitur upload, moderation, atau operasi database, siapkan **proyek Supabase staging** dan isi `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`. Jangan menaruh secret/service_role key atau password admin di frontend atau repository publik.

## Status dan batasan source

- React homepage terbaru **telah direkonstruksi dari JavaScript yang dideploy**, bukan dipulihkan sebagai JSX original.
- Source hasil rekonstruksi sudah diformat, diberi nama komponen yang jelas, dan **lulus GitHub Actions build**. Sisa nama variabel internal perlu refactor bertahap.
- Source form upload `upload.html` + `src/upload.js` dapat diedit dan masuk ke build multi-page Vite.
- File gambar masih memakai backup aset `apps/live-public/dist/` agar tampilan tidak berubah mendadak.
- Backend dan SQL tersedia, tetapi **uji end-to-end dengan akun moderator, upload video iPhone, dan perubahan database produksi belum dinyatakan lulus**.

Jangan menghapus folder versi lama sampai refactor selesai; versi tersebut disimpan untuk backup dan membandingkan tampilan.

## Kolaborasi

Bekerja dari `main`, buat branch fitur (misal `feat/header-mobile`), `npm run build`, lalu buat Pull Request. GitHub Actions otomatis memeriksa build frontend.

Dokumentasi lain: [Team Setup](docs/TEAM_SETUP.md), [Status & provenance](docs/STATUS.md), [Security](docs/SECURITY.md).

### Link

Website: https://wingking-studio.vercel.app/

Admin: https://wingking-private-review-console.vercel.app/

Repo: https://github.com/Unknown2-1/wingking-studio-full
