# ASK WINGKING — chatbot website (5 November 2026)

## Sistem saat ini
- Widget terisolasi pada \`apps/web/src/WingkingAssistant.jsx\` dan CSS yang sejalan dengan visual festival Wingking.
- Backend \`supabase/functions/wingking-studio-assistant/index.ts\` deployed sebagai Supabase Edge Function publik.
- Sumber fakta: informasi website yang telah dikonfirmasi, contact person, dan daftar band/rilisan yang telah \`approved\` dan \`is_published\`.
- Fitur chat tidak menerima atau menyimpan email, nomor HP, maupun identitas pelanggan. Riwayat percakapan disimpan dalam state browser selama halaman terbuka.
- Pembatasan otomatis: maksimal 12 pertanyaan/15 menit per identitas koneksi. Server menyimpan hash koneksi, bukan isi chat. Tabel \`wk_ai_requests\` dilindungi RLS dan tidak dapat diakses pengguna anonim.

## Mengaktifkan respons AI generatif
Frontend dan Edge Function tetap bisa menjawab FAQ tanpa kunci AI (**mode info**). Untuk mengaktifkan jawaban AI generatif, buka:
\`https://supabase.com/dashboard/project/kiuhzrowbypovoydymam/settings/functions\`
lalu di **Edge Functions → Secrets** tambahkan:

- \`GEMINI_API_KEY\`: API key dari Google AI Studio, simpan sebagai secret server; **jangan taruh di variabel VITE_ atau GitHub**.
- \`WINGKING_AI_MODEL\` (opsional): default \`gemini-3.8-flash\` (bisa disesuaikan dengan model yang tersedia pada akun API).

Perubahan secret berlaku tanpa build Vercel ulang. Backend memakai endpoint Google Gemini \`generateContent\`; bila model tidak dapat diakses, layanan mengembalikan jawaban informasi terkurasi, bukan mengarang.

## Uji penerimaan
1. Buka \`https://wingking-studio.vercel.app\` dan klik **TANYA WINGKING** di kanan bawah.
2. Tes pertanyaan lokasi, booking H-1, harga, layanan, cara upload, video.
3. Jawaban harga, slot, dan jam buka harus mengarahkan ke contact person tanpa mengarang detail.
4. Tes tampilan di iPhone Safari dan Chrome desktop, Esc menutup, tombol WhatsApp dan Maps bekerja.
5. Setelah secret Gemini terpasang, kirim pertanyaan terbuka tentang Wingking dan cek label **WINGKING AI** (bukan **INFO WINGKING**).
6. Untuk cek API: \`POST https://kiuhzrowbypovoydymam.supabase.co/functions/v1/wingking-studio-assistant\` dengan body \`{"message":"Cara booking?"}\`; respons berisi \`reply\` dan \`mode\`.

## Batasan penting
- Bot bukan pengganti admin dan tidak menyimpan booking atau memutuskan persetujuan.
- Data harga dan jam buka tidak diisi tanpa sumber yang disetujui klien.
- Pengiriman OTP email berada pada konfigurasi SMTP terpisah dari chatbot.
- Pemilik project perlu mengatur dan menjaga rahasia API key secara pribadi, tanpa mengirimkannya lewat chat.
