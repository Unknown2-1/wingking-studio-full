# WINGKING STUDIO — Sinkronisasi source untuk tim
Diperbarui 12 November 2026.

## Project yang benar
- Repo resmi: https://github.com/Unknown2-1/wingking-studio-full.git
- Website live: https://wingking-studio.vercel.app
- Dashboard admin: https://wingking-private-review-console.vercel.app
- Kode website aktif: `apps/web/src/App.jsx`, `apps/web/src/style.css`, `apps/web/src/upload.js`
- Kode admin aktif: `apps/admin-unified/index.html`
- Repo lama `Epan0310/wingking-studio` bukan sumber code utama website terbaru.
- `apps/live-public/dist` adalah aset dan snapshot backup, bukan kode website React aktif.
- Branch utama `main` untuk versi yang sama dengan website production. Branch `dev/unknown2-1` untuk kerja kolaboratif; kedua branch disinkronkan pada saat panduan ini dibuat.

## Jika project sudah diclone dari repo resmi
Jalankan ini di root folder project (terminal VS Code / PowerShell):

```bash
git status
git remote -v
git fetch origin --prune
git switch main
git pull --ff-only origin main
git rev-parse --short HEAD
cd apps/web
npm install
npm run dev
```

Jika akan mengerjakan branch tim, ganti langkah `git switch main` dan `git pull ... main` menjadi:

```bash
git switch dev/unknown2-1
git pull --ff-only origin dev/unknown2-1
```

Jangan paksa pull jika `git status` menampilkan perubahan lokal yang belum disimpan. Simpan atau commit pekerjaan lebih dulu.

## Jika remote ternyata repo lama / riwayat berbeda
Jangan mengubah origin sembarangan lalu force pull. Cara paling aman: clone ulang **ke folder baru**, jangan hapus folder lama sebelum perubahan lokal diselamatkan:

```bash
git clone https://github.com/Unknown2-1/wingking-studio-full.git
cd wingking-studio-full
cd apps/web
npm install
npm run dev
```

## Kenapa localhost masih berbeda dengan Vercel?
Vercel mempunyai variabel lingkungan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY`; `.env.local` **tidak ada di Git** karena diabaikan demi keamanan. Bila nilainya kosong di localhost, source React secara sengaja beralih ke data DEMO, sehingga kartu band/rilisan bisa terasa seperti template.

Buat konfigurasi lokal dengan:
```powershell
cd apps/web
Copy-Item .env.example .env.local
```

Atur `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY` untuk project **staging** tim (jangan pernah menaruh service_role/secret API key pada `VITE_*`). Minta konfigurasi staging resmi ke pengelola project; jangan mengunggah `.env.local` ke GitHub.

Jika perlu meniru data website live, gunakan akses **read-only / akun pengujian** yang disetujui tim dan jangan menjalankan aksi publish, delete, atau upload uji pada data production.

## Cek server
- `npm run dev` dari `apps/web` membuka http://localhost:3000
- Dari root repo jalankan `npm run dev:admin` untuk dashboard admin di http://localhost:3001
- Buka Vercel jika butuh memeriksa website production: https://wingking-studio.vercel.app
- Setelah pull, jalankan `git rev-parse --short HEAD`; cocokkan commit dengan tab Commits GitHub.
- Jika masih menampilkan tampilan lama, berhentikan Vite, lalu jalankan `npm run dev` dari `apps/web`, bukan server `legacy-nextjs` atau folder snapshot.

## Catatan backend OTP
OTP email bergantung pada SMTP Supabase dan Gmail App Password. Git pull / deploy frontend tidak akan otomatis memperbaiki kredensial SMTP yang ditolak Google. Lihat `docs/wingking-otp-setup.md`.
