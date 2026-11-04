# Wingking Studio — Frontend yang bisa diedit

**Status:** kode React telah direkonstruksi dari build website yang pernah dideploy. Ini bukan file JSX asli developer sebelumnya. Layout, logika dan CSS produksi dipertahankan sebagai titik awal untuk refactor.

## Stack
- React 19 + Vite 6 (frontend)
- Supabase PostgreSQL + Auth + Storage + Edge Functions (backend)
- CSS biasa + Lucide React icons
- Homepage: band, rilisan, video, pricing, kontak.
- Form `/upload.html` sekarang memiliki source HTML dan JavaScript sendiri di `upload.html` dan `src/upload.js`.

## Menjalankan
```bash
cd apps/web
npm install
cp .env.example .env.local    # Windows: copy .env.example .env.local
npm run dev                    # http://localhost:3000
npm run build                  # menghasilkan apps/web/dist/
```

Tanpa konfigurasi Supabase, homepage memakai data contoh. Untuk menguji simpan/review/upload gunakan **proyek staging** dan data dummy.

## Lokasi file
- `src/App.jsx`: komponen & logika website (hasil rekonstruksi React.createElement; perlu refactor untuk penamaan dan JSX lebih bersih).
- `src/main.jsx`: entry React.
- `src/upload.js` dan `upload.html`: upload band/video, di-edit dan di-build bersama homepage.
- `src/config.js`: konfigurasi Vite.
- `src/style.css`: CSS situs.
- `../live-public/dist/assets/`: gambar, logo, dan snapshot JS lama (dipakai oleh Vite publicDir).
- `../admin-unified/index.html`: source dashboard admin gabungan, beda aplikasi.
- `../../supabase/`: kode backend dan migrasi skema.

## Batasan
Sumber JSX asli versi terbaru belum dipulihkan; source ini adalah rekonstruksi yang sudah bisa di-build, bukan file original. File `src/App.jsx` adalah konversi sumber semantik dari bundle terdeploy; masih memiliki nama variabel minified. Jangan hapus folder snapshot `live-public/dist` sampai aset dipindah ke `public/` secara lengkap.

Jangan gunakan API secret/service_role key di frontend. Database produksi tidak boleh dipakai untuk pengujian penghapusan atau approval.

## Verifikasi teknis

Build source terbaru telah lulus GitHub Actions `Verify Wingking editable web source`. Jalankan `npm run build` sendiri sebelum mengirim revisi, dan gunakan file entry di `apps/web/` (bukan berkas kompilasi di `apps/live-public/dist/`).
