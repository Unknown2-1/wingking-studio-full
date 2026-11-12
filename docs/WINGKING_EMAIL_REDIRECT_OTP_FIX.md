# WINGKING — Perbaikan OTP & Link Email (6 November 2026)

## Diagnosis
Log Supabase Auth menunjukkan GET /verify HTTP 303 dengan referer http://localhost:3000.
Link email produksi sebelumnya berakhir di localhost; beberapa link juga sudah kedaluwarsa/terpakai.

## Perubahan kode
- Studio Season diganti Studio Sessions pada navigasi dan tombol hero.
- Semua signInWithOtp mengirim emailRedirectTo eksplisit ke website production.
- Form band/video/rilisan: https://wingking-studio.vercel.app/upload.html
- Form foto galeri: https://wingking-studio.vercel.app/?gallery=upload
- Link galeri membuka kembali popup dan status email terverifikasi disinkronkan via onAuthStateChange.
- Kode OTP 6 digit tetap tersedia tanpa perlu klik email link.

## PENTING: Setelan Supabase Dashboard
Konfigurasi Auth URL masih harus sesuai; GitHub tidak dapat mengubahnya sendiri.
Buka https://supabase.com/dashboard/project/kiuhzrowbypovoydymam/auth/url-configuration
Site URL: https://wingking-studio.vercel.app
Redirect URLs tambahan (Exact):
- https://wingking-studio.vercel.app/
- https://wingking-studio.vercel.app/upload.html
- https://wingking-studio.vercel.app/?gallery=upload
Email template **Confirm signup** dan **Magic Link**: gunakan `{{ .Token }}` agar pengguna mendapat kode OTP; `{{ .ConfirmationURL }}` boleh ditambahkan sebagai tautan alternatif. Alur akun baru dapat memakai template Confirm signup, jadi jangan hanya mengubah Magic Link.
Pastikan tidak ada link localhost hardcoded di email template. Jika tautan masih mengarah ke localhost, cek Site URL dan Redirect URLs di konfigurasi Auth.
Jangan mengirim service_role key ke frontend.

## Pengujian end-to-end setelah setelan Supabase Auth tersimpan
1. Minta email verifikasi BARU; link lama tidak berubah dan tidak bisa diperbaiki.
2. Klik tautan, pastikan dibuka di wingking-studio.vercel.app, bukan localhost.
3. Uji upload band dan galeri setelah login; foto publik tetap perlu persetujuan admin.
4. Uji manual input OTP 6 digit tanpa klik tautan.