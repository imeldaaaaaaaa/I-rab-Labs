# Catatan Revisi I'rab Labs v0.8.3

## Perubahan pembelajaran
- 23 submateri dengan 3 soal per submateri: Dasar, Menengah, dan Lanjutan.
- Variasi struktur nahwu di seluruh submateri; bukan hanya penggantian kosakata.
- 19 soal menampilkan kelompok analisis frasa, misalnya jumlah ismiyyah dengan khabar syibh jumlah, khabar jumlah fi'liyyah, khabar muqaddam, dan susunan idhafah.
- Rincian i'rab setiap kata dalam kelompok tetap tersedia.
- Petunjuk dibuat kontekstual berdasarkan kata dan kelompok frasa. Setelah pemeriksaan, jawaban yang keliru memperoleh koreksi, alasan, dan bentuk i'rab yang benar.
- Penilaian kata dan batas kelulusan 80/100 tetap dipertahankan.

## Perubahan guru dan admin
- Bank soal lengkap berisi seluruh 69 soal dapat dibuka dari Panel Guru/Admin.
- Guru/admin dapat melihat teks Arab, terjemahan, tingkat kesulitan, kelompok analisis, kunci jawaban, dan pembahasan.
- Filter submateri dan pencarian soal tersedia.
- Tombol "Coba kerjakan soal ini" membawa guru/admin ke mode latihan.
- Statistik per soal menampilkan siswa yang mencoba, siswa yang berhasil menyelesaikan semua unsur, siswa yang belum berhasil, total pemeriksaan, dan persentase benar per kata.
- Statistik hanya menghitung akun role `student`; latihan guru/admin tidak mencemari evaluasi siswa.
- Endpoint statistik memerlukan autentikasi guru/admin dan hanya mengirim data agregat.

## Database dan deployment
- Versi kurikulum dinaikkan ke `v083`; progres v0.8.2 untuk kunci yang tidak berubah disalin ke versi baru, sementara tujuh unsur yang kunci i‘rabnya dikoreksi harus dikerjakan ulang. Cache browser lokal juga dimigrasikan otomatis.
- Jalankan `supabase/migrations/20261105_v083_staff_analytics.sql` pada Supabase sebelum deploy. Migrasi memperbaiki pembaruan status jawaban terakhir ketika siswa mengulang.
- Gunakan Node.js 22.x pada Vercel.
- Ikuti `MULAI_DI_SINI.md` untuk pemasangan.

## Hotfix deployment Vercel
- Memperbaiki ESLint `@typescript-eslint/no-explicit-any` pada endpoint statistik soal dengan menggunakan tipe `ProgressRow` eksplisit.
