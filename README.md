# I'rab Labs — v0.8.3

Aplikasi latihan i‘rab berbasis Next.js 15, React 19, dan Supabase. Panduan pemasangan dan migrasi ada di **MULAI_DI_SINI.md**.

## Fitur pembelajaran
- 69 soal untuk 23 submateri; setiap submateri berisi 3 soal progresif (Dasar, Menengah, Lanjutan).
- Variasi jumlah ismiyyah, jumlah fi‘liyyah, khabar mufrad/jumlah/syibh jumlah, khabar muqaddam, mubtada’ mu’akhkhar, dan struktur nahwu lain sesuai submateri.
- Kelompok frasa untuk fungsi nahwu yang dianalisis sebagai satu kesatuan, dengan rincian i‘rab internal setiap kata.
- Petunjuk kontekstual per kata/frasa dan koreksi jawaban yang menjelaskan bentuk i‘rab yang tepat.
- Penilaian per unsur kata; nilai minimal 80/100 membuka materi berikutnya.
- Riwayat pengunjung di browser, riwayat akun di Supabase, dan sinkronisasi jawaban online.

## Fitur guru dan admin
- Bank soal lengkap: semua 69 soal, terjemahan, tingkat kesulitan, kunci analisis, dan pembahasan.
- Filter submateri dan pencarian soal.
- Guru/admin dapat mencoba soal dari bank soal; pembatasan urutan siswa tidak berlaku bagi staff.
- Statistik per soal: jumlah siswa yang mencoba, siswa yang berhasil menyelesaikan semua unsur, siswa yang belum berhasil, total pemeriksaan, dan tingkat keberhasilan per kata.
- Statistik hanya mengagregasi akun role `student` dan tidak menampilkan identitas siswa. Percobaan guru/admin tidak masuk ke statistik siswa.

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

Isi environment variables Supabase pada Vercel sesuai `MULAI_DI_SINI.md`. Jangan commit `.env.local` atau `SUPABASE_SERVICE_ROLE_KEY`.

## Arsitektur dan izin
- `data/curriculum.ts` menjadi sumber bank soal, analisis kelompok, kunci, petunjuk, dan aturan nilai.
- `data/exercises.ts` menyimpan tipe serta bank latihan lama.
- `/api/progress` memverifikasi sesi, memeriksa akses materi siswa, menilai jawaban di server, dan menyimpan melalui RPC `service_role`.
- `/api/question-analytics` hanya dapat diakses guru/admin dan mengirim statistik agregat untuk akun siswa.
- `/api/students` dan `/api/feedback` tetap dilindungi autentikasi dan role.
- `supabase/migrations/20261105_v083_staff_analytics.sql` memperbarui status jawaban terakhir saat siswa mengulang.

## Catatan data
- Versi kurikulum aktif adalah `v083`. Progres v0.8.2 yang kuncinya tidak berubah disalin ke v0.8.3; tujuh unsur kata yang kuncinya diperbaiki perlu dijawab ulang.
- Statistik soal dihitung dari status terakhir yang tersimpan untuk setiap unsur kata per siswa. Persentase berhasil pada satu soal berarti persentase siswa yang pernah mencoba dan status terakhir seluruh unsur jawabannya benar.
- Data statistik baru muncul setelah siswa mengerjakan soal pada versi `v083` dan jawaban tersinkron ke Supabase.
- Bank soal dan kunci perlu ditinjau pengajar Nahwu sebelum digunakan sebagai asesmen formal.
