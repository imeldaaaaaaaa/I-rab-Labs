# Bedah I‘rab — prototipe v0.4

Website latihan Nahwu interaktif dengan jalur belajar berurutan, target 10 soal pada setiap submateri, ambang nilai 80%, dan alur permohonan guru yang dapat mengirim undangan email unik setelah disetujui admin.

## Jalankan lokal

Persyaratan: Node.js LTS.

```bash
npm install
npm run dev
```

Buka http://localhost:3000. Jalankan `npm run typecheck`, `npm run lint`, dan `npm run build` sebelum deploy.

## Fitur v0.4

- 22 submateri × 10 slot soal = 220 slot latihan dalam jalur bertahap.
- Materi berikutnya mensyaratkan minimal 80% (8 dari 10 soal).
- Contoh ayat Al-Qur’an tidak digunakan pada bank latihan.
- Pengunjung bisa mencoba latihan; pendaftaran publik hanya membuat akun siswa.
- Halaman publik **Jadi Guru** untuk mengajukan nama, email, institusi, pengalaman, dan alasan bergabung.
- Admin yang sudah terautentikasi dapat melihat permohonan guru, menolak, atau menyetujui.
- Persetujuan membuat token acak yang disimpan dalam bentuk hash, ditujukan ke email calon guru, hanya sekali pakai, dan kedaluwarsa dalam 48 jam.
- Email undangan dikirim melalui Resend. Link undangan hanya mengaktifkan role jika calon guru login/daftar dengan email yang sama dengan email undangan.
- Tidak ada pendaftaran admin publik. Akun admin awal harus dibuat melalui proses penyiapan manual yang terdokumentasi di bawah.
- Data permohonan guru dan undangan tidak dapat diakses langsung oleh client; endpoint server menggunakan service-role key setelah verifikasi admin.

**Kualitas bank soal:** 220 slot adalah kerangka latihan dari bank kalimat dan analisis yang ada. Beberapa submateri lanjutan masih membutuhkan soal unik yang disusun dan ditinjau pengajar Nahwu. Jangan gunakan untuk penilaian formal sebelum semua soal diverifikasi.

## Konfigurasi Supabase dan email

1. Buat proyek Supabase.
2. Buka SQL Editor, tinjau lalu jalankan seluruh `supabase/schema.sql` pada proyek pengembangan.
3. Pada Authentication → URL Configuration, atur Site URL dan Redirect URLs untuk domain lokal/deploy. Aktifkan verifikasi email.
4. Salin `.env.example` menjadi `.env.local`, lalu isi:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` — **server-only, jangan pernah gunakan awalan `NEXT_PUBLIC_` atau commit ke Git**
   - `RESEND_API_KEY` — server-only
   - `RESEND_FROM_EMAIL` — alamat pengirim/domain yang sudah diverifikasi di Resend
   - `APP_BASE_URL` — URL website, misalnya `http://localhost:3000` saat lokal dan URL HTTPS produksi saat deploy
5. Restart server setelah mengubah environment variables.

### Membuat admin pertama dengan aman

1. Daftarkan akun pemilik lewat formulir pendaftaran siswa dengan email yang kamu kendalikan.
2. Selesaikan verifikasi email dan login sekali agar profil dibuat oleh trigger database.
3. Di Supabase SQL Editor, ganti alamat berikut dengan email pemilik yang benar-benar kamu kendalikan dan jalankan **hanya sekali**:

```sql
update public.profiles
set role = 'admin', updated_at = now()
where id = (
  select id from auth.users
  where lower(email) = lower('EMAIL_ADMIN_KAMU')
);
```

4. Pastikan query hanya memperbarui satu baris dan cek `public.profiles` untuk memastikan role menjadi `admin`.
5. Keluar lalu masuk kembali ke website. Jangan membuat endpoint publik untuk menetapkan role admin.

### Cara permohonan guru berjalan

1. Calon guru membuka menu **Jadi Guru** dan mengirim pengajuan.
2. Pengajuan tersimpan dengan status `pending` dan muncul pada panel admin setelah Supabase dikonfigurasi.
3. Admin memilih **Setujui & kirim email** atau **Tolak**.
4. Jika disetujui, server membuat token acak, menyimpan hash token, dan mengirim email via Resend. Link berlaku 48 jam dan hanya dapat digunakan sekali.
5. Calon guru membuka link, lalu daftar atau masuk menggunakan email yang diundang. Jika mendaftar, verifikasi email sesuai alur Supabase. Setelah login, sistem menukar undangan melalui endpoint server dan menetapkan role `teacher`.
6. Jika pengiriman email gagal, permohonan dikembalikan ke `pending`; admin dapat memperbaiki konfigurasi lalu mencoba lagi.

Jangan bagikan service-role key atau Resend API key. Pastikan domain pengirim telah diverifikasi di Resend sebelum mencoba mengirim email sungguhan.

## Keamanan dan batasan yang diketahui

- RLS aktif pada tabel dan tabel permohonan guru/undangan tidak memiliki policy client; akses dikelola oleh route server terpercaya.
- API admin memeriksa access token dan role admin dari database setiap permintaan.
- Endpoint publik permohonan memiliki validasi input dan honeypot sederhana, tetapi **belum memiliki rate limiting/CAPTCHA**. Tambahkan perlindungan spam sebelum membuka aplikasi untuk publik luas.
- Progres latihan masih disimpan di `localStorage`, bukan tabel `attempts`/`lesson_progress`, sehingga belum tersinkron lintas perangkat. Nilai juga belum divalidasi penuh di server. Jangan gunakan sebagai platform penilaian siswa sungguhan sebelum dua hal tersebut diselesaikan.
- Panel guru masih prototipe; tampilan progres demo belum terhubung ke progres Supabase per kelas.
- Kode undangan dari URL disimpan sementara di `localStorage` agar dapat bertahan selama verifikasi email. Token satu kali dan masa berlaku 48 jam; gunakan perangkat/browser yang sama sampai proses aktivasi selesai.
- Build belum dijamin pada semua lingkungan. Jalankan typecheck/lint/build dan uji dengan akun siswa, guru, dan admin sebelum deploy.

## Deploy

1. Push proyek ke GitHub tanpa `.env.local` atau secret.
2. Import repository ke Vercel.
3. Tambahkan environment variables yang sama di Project Settings → Environment Variables.
4. Gunakan `APP_BASE_URL` sebagai URL HTTPS website yang benar-benar digunakan.
5. Uji formulir pengajuan, email, undangan kedaluwarsa/satu kali, mismatch email, dan akses RLS sebelum membuka pendaftaran publik.

## Pembaruan latihan v0.5.0
- Setiap submateri berisi 5 soal.
- Kalimat Arab ditampilkan utuh dan setiap kata di dalamnya dapat dipilih untuk dianalisis.
- Pengguna harus menjawab seluruh kata dalam satu kalimat dengan benar sebelum melanjutkan ke soal berikutnya.
- Nilai minimal 4 dari 5 soal (80%) diperlukan untuk membuka submateri berikutnya.
- Perubahan ini mempertahankan desain dan fitur login/role yang sudah ada.

## Latihan bertahap v0.5.1

- Setiap submateri menyediakan 5 soal dengan kalimat yang dipilih agar tidak berulang dalam satu submateri jika bank soal memiliki pilihan yang cukup.
- Empat submateri awal membatasi opsi analisis secara bertahap: (1) jenis kata dan status i‘rab; (2) ditambah mu‘rab/mabnī; (3) ditambah ma‘rifah/nakirah; (4) ditambah mufrad/tatsniyah/jamak.
- Submateri berikutnya tetap menggunakan analisis lengkap yang sudah tersedia.
- Semua kata pada kalimat harus dianalisis dengan benar sebelum soal berikutnya dapat dibuka; minimal 4 dari 5 soal untuk membuka submateri selanjutnya.
- Desain, autentikasi, panel guru/admin, dan konfigurasi Supabase dipertahankan.

Catatan validasi: dependensi npm tidak dapat diinstal dalam sesi pembuatan ini karena proses instalasi melewati batas waktu, sehingga build Next.js belum dapat dijalankan di sini.


## v0.6.3 — Animasi transisi belajar

- Kartu soal masuk dengan transisi lembut setiap kali berpindah soal atau materi.
- Momen keberhasilan menampilkan maskot, konfeti tambahan, dan pesan penyemangat.
- Animasi menghormati pengaturan `prefers-reduced-motion` pada perangkat pengguna.
