# Patch Bedah I‘rab — syarat wajib 3/3

**Ini ZIP patch untuk proyek Irab Labs yang sudah ada, bukan ZIP source lengkap.** Patch mengubah 10 file ketika dijalankan pada root repository yang sesuai.

## Cara pakai

1. Unduh ZIP source proyek Irab Labs dari GitHub dan ekstrak.
2. Cadangkan folder proyek terlebih dahulu.
3. Ekstrak isi ZIP patch ini ke folder root proyek (folder yang berisi `package.json`).
4. Buka terminal di folder root proyek dan jalankan:

   ```bash
   node apply-3of3-patch.mjs
   npm ci
   npm run test:curriculum
   npm run typecheck
   npm run lint
   npm run build
   ```

5. Jika pemeriksaan lulus, commit file yang berubah ke GitHub dan deploy sesuai alur hosting proyek.

## Perubahan

- 22 submateri × 3 soal = **66 soal**.
- Materi berikutnya terkunci sampai ketiga soal pada materi sebelumnya tuntas: **3/3 = 100%**.
- Tampilan nomor soal, progres siswa, dan dashboard guru mengikuti jumlah soal baru.
- API server memeriksa syarat 3/3, bukan hanya antarmuka.
- Riwayat pada soal terpilih dipertahankan dengan mempertahankan ID soal. Dua soal yang tidak lagi dipilih tidak dihitung dalam progres aktif.
- Versi kurikulum tetap `v070`; tidak perlu migrasi SQL Supabase baru.

Script memvalidasi target perubahan sebelum menulis file. Jika struktur source berbeda dari versi yang diharapkan, script berhenti dan tidak menulis perubahan parsial.
