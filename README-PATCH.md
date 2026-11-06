# Catatan Revisi I'rab Labs v0.9.4

## 1. Pengajuan guru dengan persetujuan admin
- Pengguna baru tetap otomatis menjadi siswa.
- Siswa harus memverifikasi email sebelum mengajukan diri menjadi guru.
- Pengajuan disimpan dengan status `pending`; pengajuan tidak mengubah role akun.
- Admin dapat melihat data pemohon dan memilih Setujui atau Tolak.
- Persetujuan membuat token undangan acak yang disimpan sebagai hash.
- Email undangan dikirim melalui Resend, berlaku 48 jam, dan hanya dapat digunakan sekali.
- Endpoint redeem memeriksa sesi, email terverifikasi, kecocokan email undangan, masa berlaku, dan status penggunaan token.
- Role guru hanya diaktifkan setelah pemohon menerima undangan.
- RPC lama `irab_register_teacher` dinonaktifkan oleh migrasi v0.9.4.

## 2. Hubungi Kami
- Menu Hubungi Kami tersedia untuk pengunjung dan pengguna login.
- Email publik diperbarui menjadi `irablabs@gmail.com`.
- Tombol email menggunakan `mailto:`.
- Kotak Saran tetap tersedia dan tetap menyimpan data di Supabase.
- Email undangan guru memakai alamat publik sebagai Reply-To.

## 3. Konfigurasi email
- Tambahkan `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, dan `APP_BASE_URL` pada Environment Variables Vercel.
- `RESEND_FROM_EMAIL` harus berasal dari domain yang diverifikasi di Resend.
- `irablabs@gmail.com` digunakan sebagai alamat kontak/Reply-To, bukan otomatis sebagai alamat pengirim Resend.

## 4. Database
- Tambahkan migrasi `supabase/migrations/20261106_v094_teacher_approval.sql`.
- Migrasi ini tidak menghapus data pengguna, progres, pengajuan, atau kotak saran.
- Untuk database yang sudah menjalankan v0.7.0 dan v0.8.3, jalankan hanya migrasi v0.9.4.
