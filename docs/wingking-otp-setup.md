# WINGKING STUDIO — mengaktifkan OTP email (Supabase Auth)

Project khusus WINGKING: `kiuhzrowbypovoydymam` (jangan ubah proyek TODOKU atau proyek lain).

## Diagnosis (10 November 2026)

OTP browser sudah menggunakan `supabase.auth.signInWithOtp` dan `supabase.auth.verifyOtp({ type: "email" })`.
Log Supabase Auth pada 9 November 2026 menunjukkan penolakan SMTP Gmail:
`535 5.7.8 Username and Password not accepted`.
Masalah pengiriman ini **tidak bisa diperbaiki hanya dengan mengubah React**.
Memperbarui kredensial SMTP harus dilakukan langsung di dashboard Supabase oleh pemilik akun.
Jangan menyimpan atau memasukkan kata sandi SMTP di repo, Vercel `VITE_*` environment variables, atau chat.

## Perbaiki pengirim email

1. Masuk ke [Supabase Authentication — SMTP](https://supabase.com/dashboard/project/kiuhzrowbypovoydymam/auth/smtp).
2. Jika tetap memakai Gmail: aktifkan Google 2-Step Verification pada akun pengirim, kemudian buat **App Password** khusus WINGKING di https://myaccount.google.com/apppasswords . Google terkadang tidak menyediakan App Password untuk akun Workspace sekolah atau akun dengan perlindungan tertentu.
3. Aktifkan Custom SMTP, lalu isikan: Host `smtp.gmail.com`, Port `587` (STARTTLS), Username = alamat Gmail pengirim, Password = **App Password baru** (BUKAN sandi login Gmail), Sender email = alamat yang sama, Sender name = `WINGKING STUDIO`.
4. Simpan konfigurasi. Alternatif produksi yang lebih andal: SMTP transaksi dari Resend/Brevo dengan domain pengirim terverifikasi.
5. Jangan mengubah SMTP tanpa akses pemilik akun pengirim, dan **jangan pernah kirim App Password ke GitHub atau chat**.

## Pastikan email membawa kode OTP, bukan cuma Magic Link

Buka [Authentication — Email Templates](https://supabase.com/dashboard/project/kiuhzrowbypovoydymam/auth/templates) → **Magic Link**. Gunakan subjek `Kode Verifikasi WINGKING STUDIO` dan template berikut:

```html
<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;background:#fbf7e8;color:#203b2e">
  <h2>WINGKING STUDIO</h2>
  <p>Masukkan kode ini untuk memverifikasi email dan melanjutkan pengajuan band.</p>
  <p style="font-size:34px;letter-spacing:7px;font-weight:800;color:#203b2e">{{ .Token }}</p>
  <p>Jangan berikan kode ini ke siapa pun. Kalau kamu tidak meminta verifikasi, abaikan pesan ini.</p>
</div>
```

PENTING: `{{ .Token }}` harus tetap persis seperti itu; Supabase akan menggantinya dengan kode satu kali pakai. Jangan pakai angka hardcoded.

## Redirect

Di [Authentication — URL Configuration](https://supabase.com/dashboard/project/kiuhzrowbypovoydymam/auth/url-configuration):
- Site URL: `https://wingking-studio.vercel.app`
- Redirect URLs: `https://wingking-studio.vercel.app/**` (mencakup `/upload.html`, `/?band=upload`, dan `/?gallery=upload`).

## Uji end-to-end

1. Gunakan email milik sendiri di `https://wingking-studio.vercel.app/?band=upload`.
2. Klik KIRIM KODE EMAIL **sekali**, tunggu sampai request sukses, lalu periksa Inbox/Spam.
3. Masukkan kode OTP yang benar, pastikan UI berubah ke formulir nama band dan Press Kit.
4. Untuk mengirim ulang kode, tunggu **60 detik** (termasuk saat kode gagal dikirim, perhatikan pesan backend).
5. Pastikan upload Press Kit masuk ke panel review admin sebagai pending. Jangan membuat data publik tanpa persetujuan.
6. Periksa Supabase Auth logs jika pengiriman gagal. `535 5.7.8` = password SMTP Gmail ditolak; `email_address_not_authorized` = masih memakai layanan bawaan yang hanya mengirim ke anggota tim; HTTP 429 = terkena rate limit.

Supabase Docs: https://supabase.com/docs/guides/auth/auth-smtp dan https://supabase.com/docs/guides/auth/auth-email-passwordless
