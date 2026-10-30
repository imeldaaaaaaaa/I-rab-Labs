# Irab Labs v0.7.1 — patch bank soal yang benar-benar diterapkan

Patch ini memperbaiki dua hal yang belum berubah pada percobaan sebelumnya: **jumlah soal per submateri** dan **variasi struktur kalimat**.

## Hasil yang dituju

- 22 submateri × 3 soal = **66 soal aktif**.
- Setiap submateri tepat 3 soal; tidak ada lagi 5 soal aktif.
- **34 jumlah ismiyyah** (termasuk jumlah ismiyyah dengan nāsikh dan dengan khabar fi‘liyyah).
- **32 jumlah fi‘liyyah**.
- Kalimat diperbarui agar tidak hanya mengganti satu-dua kata; 66 kalimat unik setelah harakat diabaikan.
- Label jenis struktur ditampilkan pada setiap soal agar siswa dapat melihat variasinya.
- Syarat membuka submateri berikutnya: **3/3 benar (100%)**.
- Progres lama `v070` tetap tersimpan di tempatnya. Bank baru memakai versi `v071`, jadi progres lama tidak otomatis dihitung sebagai jawaban benar untuk soal baru.
- Tidak perlu migrasi SQL Supabase baru.

## Penting: jangan unggah ZIP patch langsung ke GitHub

ZIP ini adalah *patch installer*, bukan file source yang langsung dipasang oleh Vercel. Installer harus dijalankan pada salinan proyek di komputer terlebih dahulu.

## Cara memasang

1. Buka repository GitHub Irab Labs → **Code → Download ZIP**. Ekstrak source project ke komputer.
2. Buka folder hasil ekstrak yang berisi `package.json`.
3. Ekstrak ZIP patch ini ke folder yang sama (root proyek). Jika diminta, izinkan file patch ditambahkan.
4. **Windows:** klik dua kali `JALANKAN-PATCH-WINDOWS.bat`. Jika tidak bisa, buka terminal pada folder proyek lalu jalankan `node apply-irab-patch.mjs`.
5. Installer harus menampilkan `Berhasil memasang patch v0.7.1`. Installer mencadangkan file lama ke `.irab-patch-backup-v071` sebelum menulis perubahan.
6. Di terminal pada folder proyek, jalankan:

   ```bash
   npm ci
   npm run test:curriculum
   npm run typecheck
   npm run lint
   npm run build
   ```

7. Jika semua perintah berhasil, unggah **file yang berubah di dalam folder proyek** ke repository GitHub pada path yang sama. Jangan mengunggah ZIP patch sebagai satu file, jangan mengunggah `.irab-patch-backup-v071`, `.env.local`, `node_modules`, atau `.next`.
8. Commit ke branch `main`. Vercel akan deploy otomatis jika integrasi GitHub aktif.

## File proyek yang diperbarui installer

- `data/curriculum.ts`
- `app/page.tsx`
- `app/components/StaffPanel.tsx`
- `app/api/progress/route.ts`
- `scripts/check-curriculum.mjs`
- `README.md`
- `MULAI_DI_SINI.md`
- `VALIDASI.md`

**Jangan jalankan di folder lain.** Installer memeriksa nama proyek `bedah-irab` dan menghentikan proses jika file atau pola source tidak cocok. Jika installer berhenti dengan pesan error, jangan unggah hasil parsial; kirim pesan errornya untuk diperiksa.

Build produksi serta integrasi dengan akun Supabase dan Vercel milikmu harus diuji setelah patch dipasang. Jangan membagikan `SUPABASE_SERVICE_ROLE_KEY` atau kredensial lain.
