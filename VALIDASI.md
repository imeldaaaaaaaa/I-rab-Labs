# Validasi Irab Labs v0.7.0

Disusun 30 Oktober 2026. Dasar repository: `imeldaaaaaaaa/I-rab-Labs`, branch `main`, commit `6a18190619cfe2ab59273bc650fa67eae8f7addf`.

## Pemeriksaan yang dilakukan

- `npm run typecheck`: lulus.
- `npm run lint`: lulus.
- `npm run test:curriculum`: 22 topik, 110 kalimat unik lintas topik, 343 kata dengan kunci yang dapat dinilai; kelima soal per topik tersedia; urutan materi dan ambang 80% diuji.
- `npm run test:database`: migrasi dijalankan dua kali pada PostgreSQL lokal PGlite dengan skema Auth dan role uji. Lulus: pendaftaran guru terverifikasi, pengajuan berulang, admin tidak berubah menjadi guru, akun belum terverifikasi ditolak, simpan jawaban atomik, retry tidak menambah hitungan, hasil benar tidak turun saat latihan ulang salah, ringkasan progres, pembatasan kirim saran, RLS siswa/guru/pengunjung, serta larangan menjalankan RPC istimewa dari client.
- `npm run build`: build produksi Next.js berhasil.
- Browser Chromium, situs lokal: jawaban salah/benar, kelanjutan antarsoal, tombol kembali, tabel review, riwayat setelah reload, review tidak menambah percobaan, materi terkunci, formulir saran, akses masuk calon guru, tampilan lebar 390 px tanpa overflow halaman, dan penolakan API tanpa autentikasi.
- Browser dengan layanan simulasi: unggah progres akun, form aktivasi guru otomatis, daftar seluruh siswa, laporan 22 materi, guru tidak mendapat inbox saran admin, serta perubahan status saran oleh admin. Simulasi tidak memakai data pengguna sungguhan.

## Batas pengujian

- Akun Supabase, email verifikasi, dan deployment Vercel produksi pemilik tidak diakses. Uji end-to-end pada layanan produksi perlu dilakukan setelah migrasi serta pembaruan kode.
- Pengujian kunci soal memeriksa kelengkapan, konsistensi penilaian, dan keunikan, bukan sertifikasi ilmiah seluruh analisis Nahwu. Tinjau bank dan pembahasan bersama pengajar sebelum menjadikannya ujian formal.
- Tidak ada migrasi otomatis jawaban lama ke soal baru. Tidak ada penghapusan pengguna/tabel/riwayat lama.
- Paket tidak memasukkan dependency terpasang, hasil build, hasil screenshot pengujian, atau kredensial.
