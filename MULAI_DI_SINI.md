# I'rab Labs v0.8.3 — Panduan pemasangan

Paket ini adalah kode lengkap project I'rab Labs. Paket tidak mengubah repository GitHub, database Supabase, atau deployment Vercel secara otomatis.

## 1. Cadangkan project dan database

1. Unduh ZIP repository GitHub yang saat ini aktif sebagai cadangan.
2. Pastikan project Supabase dan Vercel yang dipakai tetap sama.
3. Jangan menghapus tabel atau akun yang sudah ada.

## 2. Jalankan migrasi Supabase

Buka **Supabase → SQL Editor → New query**.

- Jika project sudah pernah menjalankan `20261030_v070.sql`, jalankan file `supabase/migrations/20261105_v083_staff_analytics.sql`.
- Jika project Supabase benar-benar baru, jalankan `supabase/schema.sql`, kemudian `20261030_v070.sql`, lalu `20261105_v083_staff_analytics.sql`.

Migrasi v0.8.3 memperbaiki penyimpanan status jawaban terakhir. Jika siswa memperbaiki jawaban yang sebelumnya salah, statusnya menjadi benar; jika jawaban terbaru salah, statusnya juga diperbarui. Migrasi juga menyalin progres v0.8.2 ke v0.8.3 untuk unsur yang kunci jawabannya tidak berubah. Tujuh unsur kata yang analisis i‘rabnya dikoreksi harus dikerjakan ulang. Progres browser lokal v0.8.2 juga dipindahkan otomatis saat website versi baru dibuka. Migrasi tidak menghapus akun atau riwayat versi lama.

## 3. Perbarui repository GitHub

1. Ekstrak ZIP ini.
2. Unggah **isi folder `I-rab-Labs-main`** ke root repository GitHub yang terhubung ke Vercel, bukan ZIP-nya.
3. Pastikan folder `app`, `data`, `lib`, `public`, `supabase`, `scripts`, serta `package.json`, `package-lock.json`, dan `tsconfig.json` berada di root.
4. Commit ke branch produksi (`main`).
5. Jangan unggah `.env.local`, `node_modules`, `.next`, atau kunci rahasia.

## 4. Periksa Vercel

Pastikan Environment Variables berikut masih terpasang:

| Nama | Keterangan |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/public key Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key khusus server |
| `APP_BASE_URL` | URL website produksi |

Gunakan Node.js 22.x. Setelah commit, Vercel akan menjalankan deployment baru jika integrasi GitHub aktif. Jangan pernah menaruh `SUPABASE_SERVICE_ROLE_KEY` di kode frontend atau repository publik.

## 5. Perubahan pembelajaran

- 23 submateri, masing-masing berisi 3 soal: Dasar, Menengah, dan Lanjutan.
- Variasi struktur mencakup jumlah ismiyyah, jumlah fi'liyyah, khabar mufrad, khabar jumlah, syibh jumlah, khabar muqaddam, mubtada' mu'akhkhar, dan kaidah lain sesuai submateri.
- Pada 19 soal, frasa yang membentuk satu fungsi nahwu ditampilkan sebagai kelompok analisis. Contoh: `الطَّالِبُ` dan `عِنْدَ الْبَابِ`; frasa khabar tetap satu kelompok, sementara rincian i'rab kata di dalamnya tetap dipelajari.
- Petunjuk dibuat kontekstual berdasarkan kata dan kelompok frasa. Setelah jawaban diperiksa, sistem memberikan penjelasan dan bentuk i'rab yang benar.
- Penilaian tetap dihitung per unsur kata. Nilai minimal untuk membuka materi berikutnya adalah 80/100. Jika belum mencapai 80, siswa mengulang materi tersebut.
- Versi kurikulum berubah menjadi `v083`. Progres lama yang kuncinya tetap sama dibawa ke versi baru; tujuh unsur yang kunci i‘rabnya diperbaiki perlu dikerjakan ulang.

## 6. Fitur guru dan admin

Buka **Panel Guru** atau **Panel Admin → Evaluasi seluruh soal**.

Guru dan admin dapat:
- melihat seluruh 69 soal, teks Arab, terjemahan, tingkat kesulitan, kunci, dan pembahasan;
- mencari soal dan memfilter berdasarkan submateri;
- mencoba mengerjakan soal melalui tombol **Coba kerjakan soal ini**;
- melihat jumlah siswa yang pernah mencoba, persentase siswa yang menyelesaikan semua unsur dengan benar, persentase yang belum berhasil, total pemeriksaan, serta tingkat keberhasilan per kata.

Statistik evaluasi hanya menghitung akun berperan **Siswa**. Percobaan guru/admin tidak dimasukkan ke statistik siswa. Identitas siswa tidak ditampilkan pada ringkasan evaluasi.

**Cara membaca statistik:** persentase berhasil pada satu soal berarti persentase siswa yang pernah mencoba soal itu dan status terakhir seluruh unsur katanya benar. Persentase per kata dihitung dari siswa yang sudah mengirim jawaban untuk kata tersebut. Total pemeriksaan adalah jumlah percobaan yang tersimpan. Data akan bertambah setelah siswa menjawab dan jawaban tersinkron ke Supabase.

## 7. Pengujian setelah deploy

1. Login sebagai siswa, kerjakan soal, lalu pastikan status sinkronisasi online berhasil.
2. Login sebagai guru/admin, buka Evaluasi seluruh soal, dan pastikan semua 69 soal tampil.
3. Buka salah satu soal, lihat kunci dan pembahasan, lalu klik **Coba kerjakan soal ini**.
4. Pastikan guru/admin dapat membuka submateri yang belum terbuka bagi siswa.
5. Minta satu siswa mengerjakan soal, lalu klik **Perbarui data** pada evaluasi. Statistik seharusnya mulai terisi.
6. Coba menjawab salah lalu memperbaiki jawaban. Status terakhir harus mengikuti jawaban terbaru.

Jika statistik masih kosong, pastikan siswa sudah mengerjakan versi v0.8.3 dan jawaban tersimpan online. Data dari versi lama tidak otomatis dipindahkan ke versi kurikulum baru.
