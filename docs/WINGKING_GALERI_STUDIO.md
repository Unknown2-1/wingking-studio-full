# WINGKING STUDIO — Galeri Studio berbasis Supabase

## Implementasi (2026-11-06)
- Popup **GALERI STUDIO** di homepage sekarang membaca \`public.wk_gallery_photos\`, bukan array 12 JPG statis.
- **12 foto lama** tetap tampil dan sudah dibuatkan record database. Berkas lama tetap berasal dari \`/assets/studio-gallery/studio-XX.jpg\` untuk kompatibilitas; file baru disimpan di Supabase Storage.
- Pengunjung menekan **UPLOAD FOTO** di popup, memverifikasi email dengan OTP, memilih JPG/PNG/WebP maksimal 5 MB, lalu mengirim.
- Gambar pengunjung masuk bucket privat \`wk-gallery-pending\`, status \`pending\`; foto tidak terlihat di publik sebelum admin menyetujui.
- Dashboard admin kini memiliki menu **Galeri Studio**, aksi upload langsung oleh admin, review setujui/tolak, preview, edit judul/caption, arsip, tempat sampah, pulihkan, hapus permanen. Foto pending juga muncul di **Review Pengajuan**.
- Persetujuan admin memvalidasi signature gambar, menyalin ke \`wk-gallery-public\`, lalu memublikasikan record. File JPG/PNG/WebP baru tidak langsung bisa dibaca publik.
- Edge Function: \`wingking-gallery\` (\`supabase/functions/wingking-gallery/index.ts\`) memverifikasi JWT user untuk semua aksi dan \`wk_moderators\` untuk aksi admin.
- Pembatasan upload: 6/hari per email pengunjung, 40/hari per admin, 250/hari total pengunjung, 5 MB per file.
- Riwayat tindakan admin dicatat sebagai \`source=gallery\` di \`wk_content_activity\`.

## Deployment
Sumber web: \`apps/web/src/App.jsx\` dan \`apps/web/src/style.css\`; sumber admin utama: \`apps/admin-unified/index.html\`.
Migrasi: \`supabase/migrations/20261106070000_wingking_moderated_studio_gallery.sql\`.

## Pemeriksaan
1. Buka homepage dan klik **GALERI STUDIO**. Foto lama tampil tanpa data hardcoded dalam React.
2. Tekan **UPLOAD FOTO**; OTP email harus sudah dikonfigurasi via Supabase Authentication SMTP.
3. Unggah foto; pastikan muncul **Menunggu** di Admin Hub dan tidak tampil di website publik.
4. Admin menyetujui → foto tayang di galeri. Tolak → foto tidak tayang dan alasan tersimpan.
5. Admin mengarsipkan/masukkan ke sampah → foto menghilang dari galeri; pulihkan → tampil lagi.
6. Admin **UPLOAD FOTO** → langsung tayang setelah unggah berhasil, tanpa melewati verifikasi pengunjung.
7. Coba format selain JPG/PNG/WebP, file >5 MB, user biasa melakukan aksi admin → harus ditolak.

**Keamanan:** Jangan menaruh service_role key di frontend; hanya Supabase server yang memilikinya. Upload foto tidak akan aktif bagi publik jika Supabase Auth SMTP OTP belum bisa mengirim kode.
