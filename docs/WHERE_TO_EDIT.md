# Panduan edit untuk tim Wingking Studio

Dokumen ini sengaja dibuat untuk programmer yang baru membuka repo. **Bukan semua folder adalah project aktif.** Yang dipakai untuk revisi terbaru:

## Peta project aktif

```text
wingking-studio-full/
├── apps/
│   ├── web/                       ← FRONTEND publik aktif (React + Vite)
│   │   ├── index.html             ← entry homepage
│   │   ├── upload.html            ← halaman upload band/video
│   │   ├── vite.config.js
│   │   ├── package.json
│   │   ├── .env.example
│   │   └── src/
│   │       ├── main.jsx           ← bootstrap React
│   │       ├── App.jsx            ← komponen halaman, band, rilisan, video, contact
│   │       ├── upload.js          ← validasi + kirim pengajuan upload
│   │       ├── config.js          ← Vite environment & Supabase public keys
│   │       └── style.css          ← styling
│   ├── admin-unified/
│   │   └── index.html             ← DASHBOARD ADMIN aktif
│   ├── live-public/dist/          ← snapshot public, aset WebP & upload lama
│   ├── private-review/           ← arsip dashboard review sebelum digabung
│   └── content-manager/          ← arsip content-manager sebelum digabung
├── supabase/
│   ├── functions/                 ← BACKEND Edge Functions (TypeScript/Deno)
│   ├── migrations/                ← DATABASE PostgreSQL, Auth policies, storage
│   └── types/
├── legacy-nextjs/                ← SOURCE Next.js lama; bukan website terbaru
└── docs/
```

## Mau revisi bagian apa?

| Mau ubah | File / komponen |
| --- | --- |
| Hero, navbar, konten homepage | `apps/web/src/App.jsx` → `HomePage` |
| Foto & kartu band | `apps/web/src/App.jsx` → `BandCard`, `BandDetailsModal` |
| Rilisan musik | `apps/web/src/App.jsx` → `ReleaseCard`, `ReleaseDetailsModal` |
| Video panggung | `apps/web/src/App.jsx` → `VideoSection`, `VideoCard` |
| Form upload pada homepage | `apps/web/src/App.jsx` → `UploadBandModal` |
| Form upload utama `/upload.html` | `apps/web/upload.html` + `apps/web/src/upload.js` |
| Layout, warna, animasi, mobile | `apps/web/src/style.css` |
| Nama & kontak booking | `apps/web/src/config.js` / `.env.local` |
| Menu review & pengelolaan admin | `apps/admin-unified/index.html` |
| Verifikasi pengajuan band/video | `supabase/functions/wingking-guest-submissions/index.ts` |
| CRUD dashboard admin | `supabase/functions/wingking-content-manager/index.ts` |
| Database, RLS, storage | `supabase/migrations/` |

**Catatan:** Kode `App.jsx` dipulihkan dari hasil build sehingga meskipun sekarang dapat dibaca/dibuild, sebagian nama variabel internal belum sempurna. Jangan anggap seluruhnya identik dengan source asli yang hilang.

## Cara menjalankan dari awal

Terminal 1 (website publik):

```bash
git clone https://github.com/Unknown2-1/wingking-studio-full.git
cd wingking-studio-full/apps/web
npm install
npm run dev
```

URL: **http://localhost:3000**. Untuk membuktikan source bisa di-build: `npm run build`. Sesudah perubahan, jalankan lagi untuk memeriksa error.

Terminal 2 (admin):

```bash
cd wingking-studio-full
npm run dev:admin
```

URL: **http://localhost:3001**.

## Database dan akses

Backend utama: **Supabase** (PostgreSQL + Auth + Storage + Edge Functions). Untuk local preview, website masuk **demo mode** jika `.env.local` tidak mengandung Supabase staging key. Jangan menggunakan data produksi untuk mencoba tombol Setujui / Tolak / Hapus.

Aplikasi admin memerlukan moderator Supabase yang resmi untuk operasi nyata. Menjalankan file admin lokal **tidak memberi izin admin secara otomatis**.

## Prosedur kerja tim

1. Pull branch `main`.
2. Buat branch fitur, contoh `git checkout -b feat/revisi-homepage`.
3. Edit file yang sesuai tabel di atas.
4. Jalankan `npm run build` di `apps/web` dan tes manual di desktop/HP.
5. Push branch, buka pull request, review sebelum merge ke `main`.

Jangan commit password, `.env.local`, service role key, database dump, atau file privat band. 
