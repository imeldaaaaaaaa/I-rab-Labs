# I'rab Labs v0.9.4 — Panduan pemasangan dan deployment

Paket ini berisi kode sumber lengkap I'rab Labs. ZIP ini tidak mengubah GitHub, Supabase, atau Vercel secara otomatis. Ikuti langkah berikut agar project produksi tetap aman.

## 1. Cadangkan project

1. Unduh ZIP repository GitHub yang saat ini aktif sebagai cadangan.
2. Pastikan project Supabase dan Vercel yang dipakai tetap sama.
3. Jangan menghapus project, tabel, akun, atau data progres lama.
4. Jangan jalankan ulang schema dasar atau migrasi lama secara acak.

## 2. Jalankan migrasi database v0.9.4

Buka **Supabase → SQL Editor → New query**.

Untuk project yang sudah menjalankan migrasi v0.7.0 dan v0.8.3 (seperti project yang sedang kita perbaiki), jalankan hanya:

`supabase/migrations/20261106_v094_teacher_approval.sql`

Salin seluruh isi file tersebut ke SQL Editor, lalu klik **Run**.

Migrasi ini:
- menonaktifkan jalur RPC lama `irab_register_teacher` yang dapat mengaktifkan guru secara langsung;
- mencabut izin eksekusi RPC lama dari `service_role`, `authenticated`, dan `anon`;
- mempertahankan jalur yang benar: pengajuan siswa → pemeriksaan admin → undangan email sekali pakai → pemohon menerima undangan → role menjadi `teacher`;
- tidak menghapus akun, profil, progres belajar, pengajuan guru, maupun kotak saran.

Migrasi aman dijalankan ulang. **Jangan jalankan ulang `20261030_v070.sql` atau `schema.sql` pada database produksi yang sudah berisi data.**

Untuk project Supabase yang benar-benar baru, urutan lengkapnya:
1. `supabase/schema.sql`
2. `supabase/migrations/20261030_v070.sql`
3. `supabase/migrations/20261105_v083_staff_analytics.sql`
4. `supabase/migrations/20261106_v094_teacher_approval.sql`

## 3. Siapkan email undangan guru dengan Resend

Persetujuan admin mengirim tautan undangan satu kali ke alamat email calon guru. Pengiriman otomatis menggunakan Resend.

1. Buat/masuk ke akun Resend.
2. Verifikasi domain pengirim di Resend.
3. Buat API Key Resend.
4. Siapkan alamat pengirim dari domain yang telah diverifikasi, misalnya `I'rab Labs <undangan@domain-anda.id>`.

Alamat publik `irablabs@gmail.com` adalah alamat kontak dan Reply-To. **Jangan gunakan `@gmail.com` sebagai alamat From Resend kecuali provider benar-benar mengizinkan dan memverifikasinya.** Gunakan domain pengirim yang sudah diverifikasi di Resend.

## 4. Periksa Environment Variables di Vercel

Buka **Vercel → Project I'rab Labs → Settings → Environment Variables**.

Pastikan variabel berikut tersedia untuk **Production**. Tambahkan juga ke Preview/Development jika pengujian dilakukan di environment tersebut.

| Nama variabel | Nilai |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/public key Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key Supabase (server-only) |
| `APP_BASE_URL` | URL website produksi, misalnya `https://irablabs.vercel.app` |
| `RESEND_API_KEY` | API key dari Resend |
| `RESEND_FROM_EMAIL` | Alamat From dari domain terverifikasi di Resend |

Catatan:
- `APP_BASE_URL` harus URL produksi yang benar, menggunakan HTTPS, tanpa trailing slash.
- `RESEND_API_KEY` dan `SUPABASE_SERVICE_ROLE_KEY` adalah rahasia server. Jangan masukkan ke kode frontend, `.env.example`, atau repository dengan nilai asli.
- Jika `RESEND_API_KEY` atau `RESEND_FROM_EMAIL` belum dipasang, pengajuan tetap dapat masuk dan terlihat oleh admin, tetapi tindakan **Setujui & kirim undangan** akan ditolak dengan pesan konfigurasi email belum tersedia.
- `.env.example` di paket ini hanya berisi placeholder. Salin menjadi `.env.local` untuk lokal dan isi sendiri.

## 5. Perbarui GitHub dan deploy ke Vercel

1. Ekstrak ZIP.
2. Buka folder `I-rab-Labs-main`.
3. Unggah **isi folder tersebut** ke root repository GitHub yang terhubung ke Vercel, bukan file ZIP-nya.
4. Pastikan folder `app`, `data`, `lib`, `public`, `scripts`, `supabase`, serta file `package.json`, `package-lock.json`, dan `tsconfig.json` berada di root repository.
5. Commit ke branch produksi (biasanya `main`).
6. Tunggu deployment Vercel berstatus **Ready**.
7. Jika Environment Variables diubah setelah deployment, lakukan Redeploy.

Gunakan Node.js 22.x. Jangan unggah `node_modules`, `.next`, `.env.local`, atau kunci rahasia.

## 6. Alur pendaftaran guru setelah deploy

### Dari sisi calon guru
1. Pengguna mendaftar sebagai siswa.
2. Pengguna memverifikasi email.
3. Pengguna login dengan akun yang sama.
4. Pengguna membuka menu **Jadi Guru**.
5. Pengguna mengisi nama, email akun, institusi, pengalaman (opsional), dan alasan bergabung.
6. Pengguna menekan **Kirim pengajuan untuk ditinjau**.
7. Status menjadi **Menunggu**. Role tetap `student`; pengguna belum mendapat akses Panel Guru.

### Dari sisi admin
1. Login menggunakan akun admin.
2. Buka **Panel Admin**.
3. Gulir ke bagian **Pengajuan menjadi guru**.
4. Periksa nama, email, institusi, pengalaman, dan motivasi.
5. Klik **Setujui & kirim undangan** atau **Tolak**.

### Aktivasi setelah disetujui
1. Calon guru menerima email undangan.
2. Tautan berlaku 48 jam dan hanya dapat digunakan sekali.
3. Calon guru membuka tautan, lalu masuk dengan email yang sama dengan email pengajuan.
4. Sistem memeriksa kepemilikan email, status verifikasi, token, dan masa berlaku.
5. Setelah undangan diterima, role berubah menjadi `teacher` dan Panel Guru tersedia.

Jika undangan tidak diterima, kedaluwarsa, atau email tidak cocok, role tidak berubah. Hubungi admin melalui menu **Hubungi Kami** untuk bantuan.

## 7. Menu Hubungi Kami

Menu **Hubungi Kami** tersedia untuk pengunjung maupun pengguna login. Menu menampilkan:
- Email publik: `irablabs@gmail.com`.
- Tombol **Kirim email kepada kami** yang membuka aplikasi email melalui `mailto:`.
- Formulir Kotak Saran untuk saran fitur, koreksi materi, laporan kendala, atau masukan lainnya.

Kotak saran tetap disimpan di Supabase dan dapat dibaca serta diubah statusnya oleh admin. Alamat email kontak publik juga digunakan sebagai Reply-To pada email undangan guru.

## 8. Pengujian setelah deployment

Lakukan pengujian menggunakan akun uji terlebih dahulu:

1. Pengunjung membuka **Hubungi Kami**, mengirim saran, lalu memastikan saran tampil di Panel Admin.
2. Admin mengubah status saran menjadi **Ditinjau** dan **Selesai**.
3. Siswa terverifikasi mengajukan diri menjadi guru.
4. Pastikan status pengajuan terlihat sebagai **Menunggu** dan role di `profiles` masih `student`.
5. Admin melihat pengajuan di Panel Admin dan menyetujuinya.
6. Pastikan email undangan diterima.
7. Buka undangan dan login dengan email pemohon yang sama.
8. Pastikan role berubah menjadi `teacher` dan Panel Guru tersedia.
9. Uji akun siswa lain untuk memastikan siswa biasa tidak dapat mengakses Panel Guru/Admin.
10. Refresh halaman dan pastikan status/data tetap tersimpan.

## 9. Perintah validasi lokal

Gunakan Node.js 22.x:

```bash
npm ci
npm run typecheck
npm run lint
npm run test:curriculum
npm run test:database
npm run build
```

Jangan menganggap deployment selesai sebelum Vercel menunjukkan status **Ready** dan pengujian alur guru serta kontak berhasil dilakukan.
