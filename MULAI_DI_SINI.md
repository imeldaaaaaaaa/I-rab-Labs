# Pembaruan Irab Labs v0.7.0

Paket ini adalah kode lengkap pengganti versi di GitHub. Website belum diubah atau di-deploy oleh pembuat paket ini.

## 1. Cadangkan versi lama

- GitHub → repository I-rab-Labs → Code → Download ZIP, simpan sebagai cadangan.
- Simpan cadangan database sesuai fasilitas yang tersedia di proyek Supabase Anda.
- Gunakan proyek Supabase yang sama; tidak perlu membuat ulang akun siswa, guru, atau admin.

## 2. Jalankan pembaruan Supabase

1. Ekstrak ZIP baru ini di komputer.
2. Buka Supabase → proyek yang dipakai Irab Labs → SQL Editor → New query.
3. Buka file `supabase/migrations/20261030_v070.sql` dari paket ini dengan editor teks.
4. Salin seluruh isinya ke SQL Editor, lalu klik Run.
5. Query menambahkan tabel dan fungsi baru. Query tidak menghapus pengguna, tabel lama, atau riwayat yang sudah ada. Aman dijalankan ulang.

Untuk proyek Supabase yang benar-benar baru, jalankan `supabase/schema.sql` dahulu, lalu migrasi v0.7 di atas. Untuk proyek lama yang sudah menjalankan website, cukup jalankan migrasi v0.7.

## 3. Perbarui kode di GitHub

1. Di repository yang sama, gunakan Add file → Upload files. Branch produksi repository yang diperiksa adalah `main`.
2. Unggah ISI folder hasil ekstrak ke root repository: `app`, `data`, `lib`, `public`, `supabase`, `scripts`, dan file konfigurasi di bagian paling luar. Jangan memasukkan seluruh proyek ke folder tambahan di dalam repository.
3. Jika GitHub meminta konfirmasi penggantian file, gunakan file baru dari paket ini. Commit dengan pesan `Update Irab Labs v0.7.0`.
4. Jangan unggah `.env.local`, kunci rahasia, `node_modules`, atau `.next`.
5. Jika repository GitHub saat ini sudah berbeda dari versi dasar `6a18190619cfe2ab59273bc650fa67eae8f7addf`, bandingkan perubahan terlebih dahulu agar edit setelah versi tersebut tidak tertimpa.

ZIP sudah mencakup seluruh folder dan `package-lock.json`. Tidak perlu mengunggah berkas ZIP-nya ke GitHub; ekstrak dan unggah isinya.

## 4. Cek konfigurasi Vercel

Gunakan project Vercel dan project Supabase yang sudah ada.

Di Vercel → Project → Settings → Environment Variables, pastikan tersedia:

| Nama | Isi |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL proyek Supabase Anda |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/public client key proyek yang sama |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key, khusus server |
| `APP_BASE_URL` | URL website produksi Anda |

Jangan mengirimkan service role key ke percakapan atau menulisnya di GitHub. `RESEND_API_KEY` dan `RESEND_FROM_EMAIL` hanya diperlukan jika masih menggunakan fitur undangan lama; pendaftaran guru baru tidak memakai Resend.

Setelah commit, periksa Deployments di Vercel. Jika auto-deploy terhubung, deploy baru akan dimulai. Jika environment variables diubah, lakukan Redeploy agar nilai baru dipakai. Root Directory harus menunjuk ke folder yang memiliki `package.json`.

Di Supabase → Authentication → URL Configuration, pastikan Site URL serta Redirect URLs sesuai domain Vercel Anda. Pertahankan verifikasi email untuk pendaftaran akun.

## 5. Coba fitur setelah deploy

- Pengunjung: jawab soal, lanjut, klik Soal sebelumnya, lihat jawaban dan pembahasan, lalu refresh. Riwayat tetap ada di browser yang sama.
- Siswa: masuk, jawab latihan, pastikan status Tersimpan online; masuk dari browser lain dan cek progres. Jika koneksi terputus, jawaban antre di browser dan dikirim ulang saat koneksi kembali atau lewat tombol Sinkronkan.
- Calon guru: daftar akun, verifikasi email, masuk, buka Jadi Guru, isi formulir. Akun langsung menjadi Guru tanpa persetujuan admin.
- Guru: buka Panel Guru, lihat seluruh siswa, lalu Lihat materi untuk progres per submateri. Guru melihat nama dan progres, bukan email siswa.
- Admin: buka panel yang sama untuk memantau semua siswa dan membaca kotak saran; ubah status saran Baru → Ditinjau → Selesai.
- Kotak saran: coba sebagai pengunjung, siswa, dan guru. Tunggu sedikitnya satu menit jika mengirim ulang; batas lima saran per jam per akun/alamat koneksi.
- Tidak ada fitur kelas dalam versi ini.

## Perubahan riwayat dan nilai

Bank baru terdiri atas 22 submateri × 5 soal = 110 kalimat unik. ID soal dan penyimpanan browser memakai versi `v070`; riwayat lama tetap ada pada tempatnya tetapi tidak dihitung untuk kalimat baru. Progres browser lama tidak bisa otomatis diketahui oleh guru atau admin jika belum pernah tersimpan ke server.

Nilai per materi adalah PERSENTASE PENGUASAAN: satu soal dianggap dikuasai jika seluruh katanya pernah dijawab benar. Siswa boleh mencoba ulang. Ini bukan persentase benar pada percobaan pertama dan bukan ujian formal. Materi berikutnya terbuka setelah empat dari lima soal dikuasai. Review tidak menambah jumlah percobaan dan tidak menurunkan penguasaan yang sudah dicapai.

Jawaban pengunjung hanya disimpan pada browser/perangkat yang dipakai; tidak dipindahkan otomatis ke akun ketika login. Jawaban yang dikerjakan setelah login disimpan pada akun itu. Progres baru menggunakan tabel `irab_word_progress`; tabel lama `attempts` dan `lesson_progress` tidak dihapus atau diisi dengan data palsu.

## Bila ada kendala

- Panel atau sinkronisasi gagal: pastikan migrasi v0.7 sudah dijalankan di proyek yang sama dengan URL/key Vercel.
- Guru belum aktif: pastikan email terverifikasi dan isi formulir setelah login. Pengajuan lama berstatus pending tidak diubah massal; pemilik akun dapat mengirim formulir kembali untuk mengaktifkannya.
- Tidak ada siswa di panel: hanya akun berperan siswa yang ditampilkan. Akun yang sudah menjadi guru tidak dihitung sebagai siswa.
- Siswa ada tetapi belum ada nilai: pastikan siswa menggunakan versi baru dan jawabannya sudah Tersimpan online.
- Saran gagal: cek service role key server dan migrasi, atau tunggu jika terkena batas kirim.
- Build gagal: lihat log Vercel. Gunakan Node.js 20.9 atau lebih baru. Jika perlu, rollback deployment Vercel ke versi sebelumnya; tabel baru boleh tetap ada.

## Validasi paket

TypeScript, ESLint, build produksi, keunikan bank soal, serta pengujian database dan browser lokal dilakukan saat penyusunan. Lihat `VALIDASI.md` untuk cakupan dan batas pengujian. Integrasi pada akun Supabase dan Vercel milik Anda perlu dicek setelah langkah di atas karena paket ini tidak mengubah layanan produksi secara langsung.
