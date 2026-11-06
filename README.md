# I'rab Labs — v0.9.4

Aplikasi pembelajaran Nahwu dan latihan i‘rab interaktif berbasis Next.js 15, React 19, dan Supabase.

## Fitur pembelajaran
- 69 soal untuk 23 submateri; setiap submateri berisi 3 soal progresif (Dasar, Menengah, Lanjutan).
- Variasi jumlah ismiyyah, jumlah fi‘liyyah, khabar mufrad/jumlah/syibh jumlah, khabar muqaddam, mubtada’ mu’akhkhar, dan struktur nahwu lain sesuai submateri.
- Kelompok frasa untuk fungsi nahwu yang dianalisis sebagai satu kesatuan, dengan rincian i‘rab internal setiap kata.
- Petunjuk kontekstual per kata/frasa dan koreksi jawaban.
- Penilaian per unsur kata; nilai minimal 80/100 membuka materi berikutnya.
- Riwayat pengunjung di browser, riwayat akun di Supabase, dan sinkronisasi jawaban online.

## Fitur siswa, guru, dan admin
- Akun baru otomatis berperan sebagai siswa.
- Siswa terverifikasi dapat mengajukan diri menjadi guru.
- Pengajuan guru harus diperiksa admin; pengajuan tidak mengubah role secara otomatis.
- Setelah disetujui, undangan satu kali dikirim ke email pemohon. Role guru baru aktif setelah pemohon masuk dengan email yang sama dan menerima undangan yang masih berlaku.
- Undangan guru berlaku 48 jam dan hanya dapat digunakan sekali.
- Admin dapat melihat daftar pengajuan, memutuskan setuju/tolak, dan memantau status pengajuan.
- Guru/admin dapat membuka seluruh bank soal, kunci, pembahasan, dan statistik agregat siswa.
- Dashboard admin dapat membaca data siswa dan mengelola status kotak saran.

## Hubungi Kami
- Menu publik **Hubungi Kami** menampilkan email kontak `irablabs@gmail.com`.
- Tombol email membuka aplikasi email pengguna melalui `mailto:`.
- Formulir Kotak Saran tetap tersedia untuk pengunjung maupun pengguna login; saran disimpan di Supabase dan dapat ditinjau admin.
- Email balasan undangan guru menggunakan `irablabs@gmail.com` sebagai alamat Reply-To.

## Migrasi database v0.9.4
Migrasi `supabase/migrations/20261106_v094_teacher_approval.sql` menonaktifkan RPC lama `irab_register_teacher` yang dahulu dapat mengaktifkan guru secara langsung melalui service role. Akses guru sekarang mengikuti jalur pengajuan admin dan undangan satu kali. Migrasi ini tidak menghapus akun, progres, pengajuan, atau masukan yang sudah ada.

## Pengembangan lokal

Gunakan Node.js 22.x.

```bash
npm ci
npm run dev
npm run typecheck
npm run lint
npm run test:curriculum
npm run test:database
npm run build
```

Salin `.env.example` menjadi `.env.local` untuk pengembangan lokal, lalu isi nilainya. Jangan commit `.env.local`, `SUPABASE_SERVICE_ROLE_KEY`, atau `RESEND_API_KEY`.

## Environment variables

| Nama | Kegunaan |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/public key Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Kunci server-only untuk API tepercaya |
| `APP_BASE_URL` | URL website yang digunakan pada tautan undangan |
| `RESEND_API_KEY` | API key Resend untuk email undangan guru |
| `RESEND_FROM_EMAIL` | Alamat pengirim dari domain yang sudah diverifikasi di Resend |

`RESEND_FROM_EMAIL` harus memakai alamat/domain pengirim yang telah diverifikasi di Resend, bukan otomatis memakai alamat Gmail publik. Email publik `irablabs@gmail.com` dipakai sebagai Reply-To dan kontak pengunjung.

## Arsitektur dan keamanan
- `data/curriculum.ts` menjadi sumber bank soal, analisis kelompok, kunci, petunjuk, dan aturan nilai.
- `/api/teacher-applications` menerima pengajuan dari pengguna terverifikasi dan tidak mengubah role.
- `/api/admin/teacher-applications` hanya dapat diakses admin; persetujuan membuat undangan dan mengirimkannya melalui Resend.
- `/api/invitations/redeem` memeriksa sesi, verifikasi email, kesesuaian email undangan, masa berlaku, dan penggunaan satu kali sebelum mengubah role.
- `/api/students` dan `/api/feedback` tetap dilindungi autentikasi dan role.
- `SUPABASE_SERVICE_ROLE_KEY` hanya boleh dipakai di server. Jangan memasukkannya ke frontend.

## Catatan kurikulum
- Versi kurikulum aktif adalah `v083`.
- Progres versi lama yang kuncinya tetap sama dibawa ke versi baru; tujuh unsur kata yang analisis i‘rabnya dikoreksi perlu dijawab ulang.
- Statistik soal dihitung dari status terakhir yang tersimpan untuk setiap unsur kata per siswa.
- Bank soal dan kunci perlu ditinjau pengajar Nahwu sebelum digunakan sebagai asesmen formal.

Panduan instalasi, migrasi, konfigurasi Resend, dan pengujian setelah deploy tersedia di **MULAI_DI_SINI.md**.
