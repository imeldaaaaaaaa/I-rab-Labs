# Validasi I'rab Labs v0.9.4

## Pemeriksaan yang berhasil dilakukan pada paket sumber

- Syntax check TypeScript/TSX: 22 file diperiksa menggunakan TypeScript transpiler; tidak ditemukan kesalahan sintaks.
- Syntax check JavaScript/MJS: 5 file diperiksa dengan `node --check`; tidak ditemukan kesalahan sintaks.
- Validasi JSON `package.json` dan `package-lock.json`: berhasil.
- `npm run test:curriculum` (dijalankan melalui `node scripts/check-curriculum.mjs`): PASS — 23 submateri, 69 soal unik, 219 unsur kata, dan ambang kelulusan 80%.
- Email publik pada source telah diseragamkan menjadi `irablabs@gmail.com`.
- Menu Hubungi Kami menampilkan alamat email publik, tombol `mailto:`, dan formulir Kotak Saran.
- Alur pengajuan guru di source memerlukan email terverifikasi, menyimpan status pending, tidak mengubah role saat pengajuan, dan menyediakan pemeriksaan admin.
- Endpoint persetujuan membuat token undangan yang disimpan sebagai hash, mengirim tautan satu kali melalui Resend, dan baru mengubah role setelah undangan ditebus oleh pemilik email yang sesuai.
- Migrasi tambahan v0.9.4 menonaktifkan RPC lama `irab_register_teacher` agar tidak ada jalur aktivasi guru langsung melalui service role.

## Pemeriksaan yang belum dapat dilakukan di lingkungan penyusunan

- `npm ci` tidak selesai karena dependency tidak tersedia di cache dan akses ke npm registry tidak berhasil diselesaikan. Karena itu `npm run typecheck`, `npm run lint`, `npm run test:database`, dan `npm run build` penuh belum dapat dijalankan.
- Migrasi SQL v0.9.4 belum dijalankan pada project Supabase milik pengguna.
- Pengiriman email Resend dan aktivasi undangan belum diuji dengan kredensial/domain Resend pengguna.
- Deployment Vercel produksi belum dilakukan dari percakapan ini.

## Sebelum produksi

1. Cadangkan repository dan database.
2. Pada project yang sudah menjalankan v0.7.0 dan v0.8.3, jalankan hanya `supabase/migrations/20261106_v094_teacher_approval.sql`.
3. Isi `APP_BASE_URL`, `RESEND_API_KEY`, dan `RESEND_FROM_EMAIL` pada Environment Variables Vercel. `RESEND_FROM_EMAIL` harus memakai domain yang sudah diverifikasi di Resend.
4. Commit isi project ke GitHub dan tunggu deployment Vercel berstatus Ready.
5. Uji pengajuan guru, persetujuan admin, email undangan, redeem undangan, serta menu Hubungi Kami.
