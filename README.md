# Irab Labs — v0.7.0

Aplikasi latihan i‘rab berbasis Next.js 15, React 19, dan Supabase. Baca **MULAI_DI_SINI.md** untuk memperbarui website yang sudah berjalan.

## Fitur

- 110 kalimat berbeda untuk 22 submateri; 5 soal per materi.
- Tahap dasar bertingkat; analisis setiap kata dengan kunci terstruktur.
- Penguasaan 80% membuka materi berikutnya; soal dan materi yang sudah terbuka bisa direview kembali.
- Review jawaban tersimpan dan pembahasan; latihan ulang tidak menghapus penguasaan terbaik.
- Riwayat pengunjung di browser, riwayat akun di Supabase, antrean sinkronisasi dengan ID permintaan unik.
- Admin dan guru membaca nama serta progres seluruh siswa tanpa fitur kelas.
- Guru aktif otomatis setelah formulir valid dari akun dengan email terverifikasi.
- Kotak saran publik dengan pembatasan kirim; inbox dan status saran khusus admin.

## Pengembangan

Node.js >=20.9. Salin `.env.example` ke `.env.local` dan isi nilai proyek untuk autentikasi/fitur online. Tanpa konfigurasi, pengunjung tetap bisa latihan dan review; tidak ada akun demo atau data siswa palsu.

```bash
npm ci
npm run dev
npm run typecheck
npm run lint
npm run test:curriculum
npm run test:database
npm run build
```

Proyek baru: jalankan `supabase/schema.sql`, lalu `supabase/migrations/20261030_v070.sql`. Proyek lama: jalankan migrasi saja. Tidak ada secret dalam paket.

## Arsitektur dan izin

`data/curriculum.ts` adalah sumber bank soal baru, penilaian, dan urutan materi. `data/exercises.ts` dipertahankan sebagai arsip bank lama dan definisi tipe. Pertanyaan baru tidak lagi mengambil kalimat cadangan dari topik lain. Huruf yang menempel dapat ditampilkan terpisah agar dapat dianalisis. Bank dan kunci perlu ditinjau pengajar sebelum dipakai untuk asesmen formal.

`/api/progress` memverifikasi sesi, memeriksa materi sebelumnya, menilai jawaban di server, lalu menyimpan melalui RPC yang hanya dapat dijalankan `service_role`. ID permintaan unik mencegah penghitungan ulang ketika retry. RLS mengizinkan siswa membaca miliknya dan guru/admin membaca progres seluruh siswa. Tidak ada izin tulis langsung dari client ke tabel progres. Penyimpanan browser dipisahkan per UUID akun dan versi kurikulum. Saran publik dikirim melalui route server; IP tidak disimpan mentah.

`/api/students` hanya untuk guru/admin, dengan paginasi 20 siswa dan detail per siswa. `/api/feedback` menerima saran dari pengunjung atau pengguna login; hanya admin yang membaca/mengubah statusnya. Rate limit database membatasi satu saran per menit dan lima per jam; header sumber IP mengandalkan perilaku proxy Vercel. Hosting lain perlu mengatur header proxy terpercaya.

`/api/teacher-applications` menggunakan identitas akun dari Supabase, bukan alamat email yang diketik di formulir. RPC mendaftarkan formulir dan mengaktifkan role guru dalam satu transaksi. Admin tidak bisa diturunkan menjadi guru melalui endpoint ini. Akun guru yang mendaftar secara terbuka tidak berarti kredensial profesinya telah diverifikasi. Guru dapat melihat seluruh siswa sesuai rancangan produk.

Endpoint undangan lama dipertahankan untuk kompatibilitas tautan yang sudah beredar. Endpoint admin tetap memeriksa admin di server. Pendaftaran guru otomatis tidak bergantung pada undangan atau Resend.

Admin pertama tetap dibuat secara manual oleh pemilik proyek di Supabase; tidak ada pendaftaran admin publik. Daftarkan akun, verifikasi email, lalu ubah `profiles.role` untuk UUID akun pemilik melalui SQL Editor. Jangan membuka fungsi role admin ke client.

## Batasan

- Pengunjung tidak disinkronkan lintas perangkat dan riwayatnya tidak otomatis dipindah saat login.
- Nilai adalah penguasaan kumulatif setelah latihan ulang, bukan nilai ujian percobaan pertama. Kunci latihan juga tersedia pada frontend untuk review.
- Jawaban versi sebelum v0.7 tidak dapat dianggap benar untuk kalimat pengganti. Data lama tidak dihapus.
- Antrean browser hanya tersedia selama data browser tidak dibersihkan. Pantau status sinkronisasi sebelum menutup akun/perangkat.
- Riwayat semua pemeriksaan individual tidak ditampilkan; yang disimpan adalah jumlah pemeriksaan dan jawaban terbaik/terakhir per kata. Event ID disimpan agar retry idempotent.
- Kredensial dan layanan produksi pemilik tidak diakses dalam penyusunan paket ini.
