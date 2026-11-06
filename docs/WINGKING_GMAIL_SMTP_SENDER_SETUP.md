# WINGKING STUDIO — Konfigurasi Pengirim OTP (Gmail SMTP)

**Sender name**: WINGKING STUDIO

**Sender email / SMTP username**: studiowingkinghub@gmail.com

## Diagnosis
2026-11-06: Supabase Auth logs menunjukkan POST /otp HTTP 429,
`error_code: over_email_send_rate_limit`. Layanan bawaan Supabase
hanya mengizinkan 2 email Auth per jam untuk seluruh project.
Penggunaan sender Gmail khusus memerlukan konfigurasi SMTP server.

## Langkah konfigurasi — hanya dilakukan di dashboard
1. Masuk akun Google `studiowingkinghub@gmail.com`.
2. Aktifkan Google 2-Step Verification; buat *App Password* dengan label `WINGKING Supabase` di https://myaccount.google.com/apppasswords.
3. Buka https://supabase.com/dashboard/project/kiuhzrowbypovoydymam/auth/smtp (atau Authentication → Emails → SMTP Settings).
4. Aktifkan Custom SMTP dan isi:
   - Sender email: `studiowingkinghub@gmail.com`
   - Sender name: `WINGKING STUDIO`
   - Host: `smtp.gmail.com`
   - Port: `465` (TLS implisit / SSL; alternatif `587` STARTTLS)
   - Username: `studiowingkinghub@gmail.com`
   - Password: **Google App Password** 16 karakter, BUKAN password login Gmail.
5. Tekan Save changes.
6. Buka Authentication → Rate Limits; custom SMTP mengizinkan pengaturan batas email (default awal 30 per jam). Pertahankan batas OTP per pengguna agar tidak menjadi sasaran spam.
7. Pastikan Authentication → URL Configuration: Site URL `https://wingking-studio.vercel.app`, Redirect URLs termasuk `/upload.html` dan `/?gallery=upload`.
8. Authentication → Emails → Templates: untuk kode enam digit gunakan `{{ .Token }}`. Jika mencantumkan tautan gunakan `{{ .ConfirmationURL }}` (tanpa localhost).
9. Uji permintaan kode baru ke satu akun pengujian dan verifikasi email diterima dari nama WINGKING STUDIO / alamat Gmail tersebut.

**Jangan pernah menaruh App Password atau Supabase service role dalam GitHub, file `.env` yang ikut dipush, frontend, atau chat.**
**SMTP belum bisa dinyatakan aktif sebelum setelan privat tersimpan dan email uji berhasil diterima.**