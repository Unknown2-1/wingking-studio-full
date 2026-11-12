[1mdiff --git a/docs/WINGKING_EMAIL_REDIRECT_OTP_FIX.md b/docs/WINGKING_EMAIL_REDIRECT_OTP_FIX.md[m
[1mindex ecca8ea..a69e1b4 100644[m
[1m--- a/docs/WINGKING_EMAIL_REDIRECT_OTP_FIX.md[m
[1m+++ b/docs/WINGKING_EMAIL_REDIRECT_OTP_FIX.md[m
[36m@@ -20,8 +20,8 @@[m [mRedirect URLs tambahan (Exact):[m
 - https://wingking-studio.vercel.app/[m
 - https://wingking-studio.vercel.app/upload.html[m
 - https://wingking-studio.vercel.app/?gallery=upload[m
[31m-Email template: pertahankan {{ .ConfirmationURL }} sebagai href, dan {{ .Token }} bila ingin kode OTP.[m
[31m-Pastikan tidak ada link localhost hardcoded di email template.[m
[32m+[m[32mEmail template **Confirm signup** dan **Magic Link**: gunakan `{{ .Token }}` agar pengguna mendapat kode OTP; `{{ .ConfirmationURL }}` boleh ditambahkan sebagai tautan alternatif. Alur akun baru dapat memakai template Confirm signup, jadi jangan hanya mengubah Magic Link.[m
[32m+[m[32mPastikan tidak ada link localhost hardcoded di email template. Jika tautan masih mengarah ke localhost, cek Site URL dan Redirect URLs di konfigurasi Auth.[m
 Jangan mengirim service_role key ke frontend.[m
 [m
 ## Pengujian end-to-end setelah setelan Supabase Auth tersimpan[m
[1mdiff --git a/docs/wingking-otp-setup.md b/docs/wingking-otp-setup.md[m
[1mindex 41ce97b..3c98909 100644[m
[1m--- a/docs/wingking-otp-setup.md[m
[1m+++ b/docs/wingking-otp-setup.md[m
[36m@@ -19,26 +19,32 @@[m [mJangan menyimpan atau memasukkan kata sandi SMTP di repo, Vercel `VITE_*` enviro[m
 4. Simpan konfigurasi. Alternatif produksi yang lebih andal: SMTP transaksi dari Resend/Brevo dengan domain pengirim terverifikasi.[m
 5. Jangan mengubah SMTP tanpa akses pemilik akun pengirim, dan **jangan pernah kirim App Password ke GitHub atau chat**.[m
 [m
[31m-## Pastikan email membawa kode OTP, bukan cuma Magic Link[m
[32m+[m[32m## Pastikan email membawa kode OTP, bukan cuma tautan konfirmasi[m
 [m
[31m-Buka [Authentication — Email Templates](https://supabase.com/dashboard/project/kiuhzrowbypovoydymam/auth/templates) → **Magic Link**. Gunakan subjek `Kode Verifikasi WINGKING STUDIO` dan template berikut:[m
[32m+[m[32m`signInWithOtp` dapat memakai template **Confirm signup** untuk email baru dan **Magic Link** untuk akun yang sudah ada. Perbarui keduanya di [Authentication — Email Templates](https://supabase.com/dashboard/project/kiuhzrowbypovoydymam/auth/templates). Jika hanya mengubah Magic Link, email akun baru masih dapat menampilkan “Confirm your email address” tanpa kode.[m
[32m+[m
[32m+[m[32mGunakan subjek `Kode Verifikasi WINGKING STUDIO` dan template berikut pada kedua template:[m
 [m
 ```html[m
 <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;background:#fbf7e8;color:#203b2e">[m
   <h2>WINGKING STUDIO</h2>[m
   <p>Masukkan kode ini untuk memverifikasi email dan melanjutkan pengajuan band.</p>[m
   <p style="font-size:34px;letter-spacing:7px;font-weight:800;color:#203b2e">{{ .Token }}</p>[m
[32m+[m[32m  <p>Atau buka website WINGKING untuk melanjutkan:</p>[m
[32m+[m[32m  <p><a href="{{ .ConfirmationURL }}">Lanjutkan ke WINGKING STUDIO</a></p>[m
   <p>Jangan berikan kode ini ke siapa pun. Kalau kamu tidak meminta verifikasi, abaikan pesan ini.</p>[m
 </div>[m
 ```[m
 [m
[31m-PENTING: `{{ .Token }}` harus tetap persis seperti itu; Supabase akan menggantinya dengan kode satu kali pakai. Jangan pakai angka hardcoded.[m
[32m+[m[32m`{{ .Token }}` harus tetap persis seperti itu; Supabase akan menggantinya dengan kode satu kali pakai. Tautan `{{ .ConfirmationURL }}` opsional; jika digunakan, URL tujuan tetap harus diizinkan pada konfigurasi URL di bawah. Jangan menaruh URL `localhost` secara langsung di template.[m
 [m
 ## Redirect[m
 [m
 Di [Authentication — URL Configuration](https://supabase.com/dashboard/project/kiuhzrowbypovoydymam/auth/url-configuration):[m
 - Site URL: `https://wingking-studio.vercel.app`[m
[31m-- Redirect URLs: `https://wingking-studio.vercel.app/**` (mencakup `/upload.html`, `/?band=upload`, dan `/?gallery=upload`).[m
[32m+[m[32m- Redirect URLs: tambahkan `https://wingking-studio.vercel.app/**` atau setidaknya URL yang dipakai aplikasi (`https://wingking-studio.vercel.app/upload.html` dan `https://wingking-studio.vercel.app/?gallery=upload`).[m
[32m+[m
[32m+[m[32mKode frontend sudah mengirim `emailRedirectTo` ke domain Vercel. Jika tautan email masih membuka `localhost`, periksa Site URL, allowlist Redirect URLs, dan pastikan template memakai `{{ .ConfirmationURL }}` alih-alih URL localhost yang ditulis langsung. Tautan email lama tidak berubah setelah setelan diperbaiki; kirim permintaan OTP baru untuk menguji.[m
 [m
 ## Uji end-to-end[m
 [m
