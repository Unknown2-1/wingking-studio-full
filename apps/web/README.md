# Wingking Studio — Frontend yang bisa diedit

**Status:** kode React telah direkonstruksi dari build website yang pernah dideploy. Ini bukan file JSX asli developer sebelumnya. Layout, logika dan CSS produksi dipertahankan sebagai titik awal untuk refactor.

## Stack
- React 19 + Vite 6 (frontend)
- Supabase PostgreSQL + Auth + Storage + Edge Functions (backend)
- CSS biasa + Lucide React icons
- Homepage: Studio Season/video, band & harga, rilisan, kontak.
- Form homepage mendukung pengajuan band dan rilisan untuk direview admin.
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

## Verifikasi email untuk pengajuan

Tab Band, Video, dan Rilisan serta halaman `/upload.html` meminta OTP email dari Supabase Auth sebelum pengunjung dapat mengunggah. Pastikan:

1. Supabase **Authentication → Providers → Email** dan konfirmasi email aktif.
2. Template email OTP menampilkan `{{ .Token }}` (kode verifikasi), bukan hanya tautan login.
3. SMTP produksi dikonfigurasi agar email OTP terkirim dengan andal dan batas pengiriman sesuai kebutuhan.
4. URL production Vercel diizinkan pada konfigurasi Auth Supabase. Edge Function `wingking-public-intake` juga memeriksa email terverifikasi dan memiliki allowlist origin tersendiri; tambahkan origin Vercel preview atau custom domain secara eksplisit bila diperlukan.
5. Terapkan migrasi `20261104142500_wingking_guest_submission_email_auth.sql`, lalu deploy Edge Function `wingking-public-intake` dan `wingking-guest-submissions` ke Supabase. Perubahan backend ini terpisah dari deploy frontend Vercel.

Setelah OTP valid, pengajuan tetap berstatus menunggu dan baru tampil setelah admin Wingking menyetujuinya. Untuk pengujian ujung ke ujung, gunakan project Supabase staging serta alamat email uji.

## Lokasi file
- `src/App.jsx`: komponen & logika website (hasil rekonstruksi React.createElement; perlu refactor untuk penamaan dan JSX lebih bersih).
- `src/main.jsx`: entry React.
- `src/upload.js` dan `upload.html`: upload band/video, di-edit dan di-build bersama homepage.
- `src/config.js`: konfigurasi Vite.
- `src/style.css`: CSS situs.
- `VITE_WHATSAPP_URL` dan `VITE_LOCATION_URL` dapat dioverride dari `.env.local`; default mengarah ke WhatsApp dan Google Maps Wingking Hub Studio.
- `../live-public/dist/assets/`: gambar, logo, dan snapshot JS lama (dipakai oleh Vite publicDir).
- `../admin-unified/index.html`: source dashboard admin gabungan, beda aplikasi.
- `../../supabase/`: kode backend dan migrasi skema.

## Batasan
Sumber JSX asli versi terbaru belum dipulihkan; source ini adalah rekonstruksi yang sudah bisa di-build, bukan file original. File `src/App.jsx` adalah konversi sumber semantik dari bundle terdeploy; masih memiliki nama variabel minified. Jangan hapus folder snapshot `live-public/dist` sampai aset dipindah ke `public/` secara lengkap.

Jangan gunakan API secret/service_role key di frontend. Database produksi tidak boleh dipakai untuk pengujian penghapusan atau approval.

## Verifikasi teknis

Build source terbaru telah lulus GitHub Actions `Verify Wingking editable web source`. Jalankan `npm run build` sendiri sebelum mengirim revisi, dan gunakan file entry di `apps/web/` (bukan berkas kompilasi di `apps/live-public/dist/`).
