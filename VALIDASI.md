# Validasi I'rab Labs v0.8.3

## Pemeriksaan yang berhasil dilakukan pada paket ini

- Transpilasi/syntax check TypeScript untuk `data/curriculum.ts`, `app/page.tsx`, `app/components/StaffPanel.tsx`, `app/api/question-analytics/route.ts`, dan `app/api/progress/route.ts`: tidak ditemukan kesalahan sintaks.
- Pemeriksaan kurikulum melalui TypeScript transpile dan eksekusi logika: 23 submateri, 69 soal, 219 unsur kata, seluruh ID dan kalimat unik pada bank, dan seluruh kunci jawaban menghasilkan hasil penilaian yang konsisten.
- Pemeriksaan seluruh kelompok analisis: 19 soal memiliki kelompok frasa; seluruh indeks anggota kelompok berada dalam rentang kata pada soal.
- Contoh `الطَّالِبُ عِنْدَ الْبَابِ`: `الطَّالِبُ` adalah mubtada'; `عِنْدَ الْبَابِ` adalah khabar berupa syibh jumlah ẓarfiyyah. Secara internal, `عِنْدَ` adalah ẓarf makān manṣūb sekaligus muḍāf, dan `الْبَابِ` adalah muḍāf ilaih majrūr.
- Pemeriksaan ambang kelulusan: skor 80/100 membuka materi berikutnya; skor di bawah 80 tidak membuka materi berikutnya.
- Endpoint statistik dibatasi untuk guru/admin, hanya mengagregasi akun berperan siswa, dan tidak mengirim identitas siswa dalam respons.
- Guru/admin dapat membuka semua materi dan soal, serta mencoba soal tanpa pembatasan urutan. Percobaan staff dikecualikan dari statistik siswa.
- Migrasi `20261105_v083_staff_analytics.sql` memperbarui RPC agar status jawaban terakhir menjadi sumber kebenaran setelah siswa mengulang.

## Pemeriksaan yang belum dapat dilakukan

- `npm ci`, `npm run typecheck`, `npm run lint`, dan `npm run build` penuh tidak berhasil dijalankan di lingkungan penyusunan karena instalasi dependency terhenti dan cache npm tidak memiliki seluruh paket yang diperlukan. Karena itu, paket ini belum boleh dianggap telah lolos build produksi.
- Migrasi SQL belum dijalankan pada project Supabase milik pengguna.
- Statistik riil belum dapat diverifikasi tanpa aktivitas siswa yang tersinkron di Supabase.
- Deployment Vercel produksi belum dijalankan dari percakapan ini.

## Catatan penggunaan

Sebelum deployment, jalankan migrasi Supabase v0.8.3, unggah isi project ke repository GitHub yang terhubung ke Vercel, lalu periksa hasil `next build` pada log deployment. Versi kurikulum berubah menjadi `v083`; progres v0.8.2 untuk kunci yang tidak berubah disalin, sedangkan tujuh unsur kata yang kuncinya diperbaiki harus dikerjakan ulang. Cache browser lokal v0.8.2 dimigrasikan otomatis.


## Perbaikan deployment Vercel — lint v0.8.3

Log Vercel menunjukkan satu kegagalan ESLint pada `app/api/question-analytics/route.ts` baris 27: penggunaan explicit `any` memicu aturan `@typescript-eslint/no-explicit-any`. Kode tersebut telah diperbaiki dengan memberi tipe `ProgressRow[]` pada hasil query sebelum memfilter berdasarkan ID siswa. Pemeriksaan sintaks TypeScript/TSX setelah perbaikan: 20 file, 0 kesalahan sintaks.

Build produksi penuh tetap perlu dikonfirmasi oleh deployment Vercel berikutnya.
