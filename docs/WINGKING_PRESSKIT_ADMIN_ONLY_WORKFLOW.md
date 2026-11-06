# WINGKING STUDIO — Band & Harga (Press Kit), Admin Video/Rilisan, Galeri
Pembaruan 6 November 2026.

## Pengunjung
- **Band & Harga**: hanya 3 input: email band yang diverifikasi via OTP, nama band, dan Press Kit PDF/DOC/DOCX maksimal 10 MB.
- Setelah unggah, file masuk status pending. Disimpan pada Storage bucket privat `wk-presskit-private` dan **tidak ada signed download publik** sebelum disetujui.
- Admin memeriksa dokumen lalu menyetujui/menolak, mengedit nama, mengarsipkan, mengembalikan, atau menghapus.
- Jika disetujui, nama band tampil di website dan tombol **DOWNLOAD PRESS KIT** meminta signed URL sementara (~2 menit). Harga hanya ada di dokumen band, tidak dibuat-buat.
- **Studio Sessions**: pengunjung hanya menonton/membuka link YouTube atau Instagram; tidak ada upload publik.
- **Rilisan**: pengunjung mencari berdasarkan nama band/rilisan dan membuka link Spotify/YouTube/Instagram; tidak ada upload publik.
- **Galeri Studio**: upload foto hanya tersedia di dashboard admin, bukan popup publik.
- Halaman `upload.html` lama dialihkan ke `/?band=upload`.

## Admin Hub
- Menu **Press Kit Band**: antrean review dan pengelolaan dokumen privat. Kiriman pending juga terlihat di **Review Pengajuan**.
- **Kelola Video**: tombol `+ LINK VIDEO` cukup URL YouTube/Instagram, tanpa judul.
- **Rilisan Musik**: tombol `+ LINK RILISAN`, hanya nama band dan URL YouTube/Instagram/Spotify.
- **Galeri Studio**: tombol `+ UPLOAD FOTO` khusus admin. Upload langsung ditayangkan.
- Aktivitas review/edit/hapus tersimpan pada `wk_content_activity`.

## Keamanan
- User biasa tidak dapat `INSERT`, `UPDATE` maupun `DELETE` langsung pada `wk_presskits` atau `wk_media_links`.
- `wk_presskits` RLS hanya mengizinkan SELECT publik pada kolom id, band_name, created_at setelah approved + published.
- Unduhan di-otorisasi oleh Edge Function; path privat tidak di-expose. URL unduhan selalu singkat.
- Endpoint publik lama `wingking-public-intake`, `wingking-guest-submissions` menerima status lama tetapi menolak pendaftaran baru; `wingking-gallery` menerima upload foto hanya admin.
- Direct self-upload lama melalui RLS wk_bands/wk_releases/wk_clips dan bucket terkait telah ditutup.
- File Word tidak diperiksa antivirus otomatis: moderator harus memeriksa isi dan metadata sebelum menyetujui.

## Penting — SMTP OTP
Kirim kode lewat pengirim Gmail studio hanya setelah `studiowingkinghub@gmail.com` / Custom SMTP Supabase diaktifkan dengan Google App Password secara privat. Limit email bawaan Supabase mungkin masih membatasi pengujian.
Tambahkan Redirect URL `https://wingking-studio.vercel.app/?band=upload` di Authentication > URL Configuration. Site URL harus `https://wingking-studio.vercel.app`.

## Checklist UAT nyata
1. Uji verifikasi email OTP baru (tidak terblokir rate limit).
2. Unggah PDF valid kecil menggunakan email terverifikasi; status pending, belum muncul publik.
3. Admin lihat/unduh, setujui; nama band muncul dan berkas bisa diunduh publik.
4. Arsipkan -> hilang dari publik; pulihkan -> tampil lagi.
5. Uji file >10MB dan salah ekstensi: ditolak.
6. Coba request langsung upload galeri dan upload lama tanpa admin: ditolak.
7. Tambah link video dan rilisan dari admin; keduanya muncul di website lalu bisa dikelola.
8. Uji tampilan ponsel/iPhone serta refresh setelah deployment.

**Status:** Code + database siap. OTP end-to-end dan upload memakai akun real harus diuji setelah SMTP stabil.
