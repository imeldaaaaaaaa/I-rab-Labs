# I'rab Labs v0.9.0 — Fantasy Adventure UI

## Arah visual
- Tema Fantasy Adventure dengan palet hijau hutan, krem perkamen, dan aksen emas.
- Maskot burung hantu sebagai teman belajar, tersedia sebagai aset SVG lokal `public/owl-mascot.svg`.
- Nuansa petualangan hadir pada hero, panel level, peta materi, kartu bagian, dan interaksi hover.
- Navigasi pada layar kecil menjadi menu horizontal yang dapat digulir.

## Gamifikasi yang digunakan
- XP dihitung dari data penyelesaian kata yang sudah ada: 10 XP untuk setiap unsur kata yang berhasil diselesaikan.
- Level diturunkan dari XP: setiap 250 XP menaikkan satu level.
- Progress level, jumlah submateri tuntas, dan persentase penyelesaian ditampilkan dari data progres yang sudah tersimpan.
- Tidak dibuat tabel XP, streak, inventori, atau reward terpisah; tidak ada data gamifikasi palsu atau hitungan streak yang tidak tercatat.

## Peta materi
- Lima kelompok materi tetap memakai nama aslinya.
- Seluruh nama 23 submateri tetap persis seperti `data/curriculum.ts`.
- Setiap submateri tetap memiliki tiga soal progresif dan tetap mengikuti syarat nilai minimal 80.
- Tombol pada peta mengarahkan ke soal pertama submateri yang dipilih, menggunakan fungsi latihan yang sudah ada.

## Fitur yang dipertahankan
- Pemeriksaan i'rab per kata dan kelompok frasa.
- Petunjuk kontekstual, koreksi jawaban, review, penilaian, serta pembukaan materi.
- Sinkronisasi progres dengan Supabase dan autentikasi akun.
- Panel guru/admin, statistik soal, serta formulir saran dan pendaftaran guru.
- Endpoint API, skema database, dan migrasi tidak diubah oleh redesign ini.

## Instalasi
1. Ekstrak ZIP dan unggah isi folder `I-rab-Labs-main` ke root repository GitHub.
2. Commit ke branch `main` yang terhubung ke Vercel.
3. Tidak perlu menjalankan migrasi Supabase baru untuk redesign visual ini.
4. Pastikan environment variables Supabase pada Vercel tidak berubah.

## Validasi
- `npm run test:curriculum`: PASS — 23 topik, 69 soal, 219 unsur kata, dan ambang buka materi 80%.
- Transpilasi/syntax check TypeScript dan TSX: 20 file, 0 kesalahan sintaks.
- Build produksi penuh Next.js belum dapat dijalankan pada lingkungan penyusunan; konfirmasi build final melalui deployment Vercel.


## v0.9.1 — Dunia Nahwu dan jalur level
- Peta utama kini berupa dunia petualangan bergambar dengan jalur batu, batu besar, sungai, pepohonan, dan lima wilayah.
- Setiap **Bab = Wilayah**. Rumah menampilkan kelompok bab yang sudah ada di kurikulum.
- Setiap **Subbab = Level**. Setelah rumah dipilih, siswa melihat jalur level di dalam rumah tersebut.
- Level berstatus terkunci, terbuka, sedang dilanjutkan, atau selesai sesuai aturan `topicUnlocked` dan `topicScore` yang sudah ada.
- Memilih level yang belum tuntas melanjutkan dari kata pertama yang belum selesai, bukan otomatis mengulang dari awal. Level tuntas dapat dibuka kembali untuk latihan ulang.
- Kelulusan level tetap memakai ambang nilai 80. Level berikutnya terbuka setelah prasyarat level sebelumnya terpenuhi.
- Nama lima bab dan seluruh 23 subbab tidak diubah.
- Tidak ada perubahan skema Supabase, tabel, API, atau migrasi database.


## v0.9.2 — Konsistensi istilah petualangan
- Istilah tampilan "Rumah Materi" diganti menjadi "Wilayah".
- Struktur istilah dibuat konsisten: Dunia = keseluruhan peta; Wilayah = Bab; Level = Subbab; Tantangan = soal latihan.
- Label pada peta, petunjuk maskot, footer peta, dan breadcrumb diperbarui.
- Nama bab dan subbab kurikulum serta isi latihan tidak diubah.


## v0.9.3 — Ikon landmark wilayah
- Ikon rumah pada peta dan halaman detail wilayah diganti dengan emblem landmark fantasi yang berbeda untuk setiap wilayah.
- Pilihan landmark: gulungan/pustaka, bangunan klasik, pegunungan, pohon besar, dan teleskop/observatorium.
- Nama wilayah, nama bab/subbab, alur level, progres, dan database tidak diubah.
