import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const packageJson=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
if(packageJson.name!=='bedah-irab')throw new Error('Jalankan installer dari root proyek Irab Labs (folder yang berisi package.json).');
const patchCurriculum=path.join(root,'patch-files','data','curriculum.ts');
if(!fs.existsSync(patchCurriculum))throw new Error('File patch-files/data/curriculum.ts tidak ditemukan. Ekstrak seluruh ZIP ke root proyek.');
const newCurriculum=fs.readFileSync(patchCurriculum,'utf8');
if(!newCurriculum.includes("CURRICULUM_VERSION = 'v071'")||!newCurriculum.includes('sentenceStructures'))throw new Error('File bank soal patch tidak valid.');

const changed=new Map();
function load(file){const p=path.join(root,file);if(!fs.existsSync(p))throw new Error('File proyek tidak ditemukan: '+file);return fs.readFileSync(p,'utf8');}
function replaceOnce(s,oldText,newText,label){const first=s.indexOf(oldText);if(first<0)throw new Error('Patch dihentikan: target tidak ditemukan pada '+label+'. Tidak ada perubahan yang ditulis.');if(s.indexOf(oldText,first+oldText.length)>=0)throw new Error('Patch dihentikan: target tidak unik pada '+label+'. Tidak ada perubahan yang ditulis.');return s.slice(0,first)+newText+s.slice(first+oldText.length);}

// Curriculum source: exactly 66 new questions and a fresh progress version.
changed.set('data/curriculum.ts',newCurriculum);

// Learner UI and 3/3 mastery gate.
{
 let s=load('app/page.tsx');
 const start=s.indexOf('  const score=available.filter');
 const end=start<0?-1:s.indexOf('\n }\n',start);
 if(start<0||end<0)throw new Error('Blok penilaian di app/page.tsx tidak ditemukan. Tidak ada perubahan yang ditulis.');
 const oldBlock=s.slice(start,end);
 if(!oldBlock.includes('score>=4')||!oldBlock.includes('4 dari 5 soal'))throw new Error('Blok penilaian bukan versi yang diharapkan. Tidak ada perubahan yang ditulis.');
 const newBlock=[
  '  const score=available.filter(e=>e.words.every((_,i)=>completed.includes(`${e.id}:${i}`))).length;',
  '  const percentage=Math.round(score/available.length*100);',
  '  const allCorrect=score===available.length;',
  '  const topicList=lessonGroups.flatMap(g=>g.topics);const topicIndex=topicList.indexOf(selectedTopic);',
  '  if(allCorrect&&topicIndex<topicList.length-1){const nextTopic=topicList[topicIndex+1];setSelectedTopic(nextTopic);chooseExercise(learningQuestions.find(e=>e.topic===nextTopic)!);setNotice(`Keren! Nilaimu ${percentage}%. Semua soal benar, materi berikutnya terbuka.`);setCelebration({kind:\'topic\',title:\'MASYAALLAH, LEVEL UP! 🌟\',message:`Kamu mendapat nilai ${percentage}% dan berhasil membuka materi “${nextTopic}”. Yuk, lanjutkan perjalanan belajarmu!`});}',
  '  else if(topicIndex===topicList.length-1&&allCorrect){setNotice(\'Selamat! Kamu menyelesaikan seluruh jalur belajar Bedah I‘rab.\');setCelebration({kind:\'finish\',title:\'LUAR BIASA, KAMU TAMAT! 🏆\',message:\'MasyaAllah! Kamu sudah menuntaskan seluruh jalur belajar. Semoga ilmu Nahwunya makin melekat!\'});}',
  '  else{const retry=available.find(e=>!e.words.every((_,i)=>completed.includes(`${e.id}:${i}`)));if(retry){chooseExercise(retry);setNotice(`Nilai materi ini ${percentage}%. Semua ${available.length} soal wajib benar; targetnya 3/3 (100%). Ulangi soal yang belum benar, ya.`);}}'
 ].join('\n');
 s=s.slice(0,start)+newBlock+s.slice(end);
 s=replaceOnce(s,'<div className="topic-tag">{exercise.topic}</div>','<div className="topic-tag">{exercise.topic} · {exercise.structure}</div>','label struktur kalimat');
 s=replaceOnce(s,"SOAL {String(available.findIndex(e=>e.id===exercise.id)+1).padStart(2,'0')} / 05","SOAL {String(available.findIndex(e=>e.id===exercise.id)+1).padStart(2,'0')} / {String(available.length).padStart(2,'0')}",'nomor soal dinamis');
 s=replaceOnce(s,"{available.findIndex(e=>e.id===exercise.id)===4?'Nilai & lanjut materi →':'Soal berikutnya →'}","{available.findIndex(e=>e.id===exercise.id)===available.length-1?'Nilai & lanjut materi →':'Soal berikutnya →'}",'tombol soal terakhir');
 s=replaceOnce(s,'{available.filter(e=>e.words.every((_,i)=>completed.includes(`${e.id}:${i}`))).length}/5 soal benar','{available.filter(e=>e.words.every((_,i)=>completed.includes(`${e.id}:${i}`))).length}/{available.length} soal benar','jumlah soal pada jalur belajar');
 s=replaceOnce(s,'Kerjakan soal sesuai urutan. Materi selanjutnya terbuka setelah minimal 4 dari 5 soal dijawab benar (80%). Materi yang sudah terbuka dapat dikunjungi kembali untuk review.','Kerjakan soal sesuai urutan. Materi selanjutnya terbuka setelah semua 3 soal dijawab benar (3/3 atau 100%). Materi yang sudah terbuka dapat dikunjungi kembali untuk review.','aturan kelulusan jalur belajar');
 s=replaceOnce(s,'Materi disusun berurutan. Setiap submateri berisi 5 soal; nilai minimal 80% diperlukan untuk membuka submateri berikutnya. Contoh ayat Al-Qur’an tidak digunakan dalam bank latihan.','Materi disusun berurutan. Setiap submateri berisi 3 soal; ketiganya wajib dijawab benar (3/3 atau 100%) untuk membuka submateri berikutnya. Contoh ayat Al-Qur’an tidak digunakan dalam bank latihan.','deskripsi materi');
 s=replaceOnce(s,'5 soal per submateri','3 soal per submateri','label jumlah soal');
 s=replaceOnce(s,'<p>{done}/5 soal dikuasai · {done*20}%</p>','<p>{done}/{qs.length} soal dikuasai · {Math.round(done/qs.length*100)}%</p>','progres kartu submateri');
 s=replaceOnce(s,'Riwayat v0.7 memakai kalimat baru; hasil versi lama tidak dihitung untuk soal pengganti.','Riwayat v0.7.1 memakai bank soal baru; progres v0.7.0 tetap tersimpan terpisah dan tidak dihitung untuk soal baru.','keterangan versi progres');
 s=replaceOnce(s,'Prototipe v0.7.0','Prototipe v0.7.1','versi sidebar');
 s=replaceOnce(s,'BEDAH I‘RAB · V0.7.0','BEDAH I‘RAB · V0.7.1','versi footer');
 for(const marker of ['score>=4','score*20','4 dari 5 soal','80%','/ 05','===4?', '/5 soal benar','5 soal per submateri','done*20'])if(s.includes(marker))throw new Error('Aturan lama masih tertinggal di app/page.tsx: '+marker);
 changed.set('app/page.tsx',s);
}

// Teacher progress report must use the actual 3-question denominator.
{
 let s=load('app/components/StaffPanel.tsx');
 s=replaceOnce(s,'<td>{done}/5</td><td>{done*20}%</td>','<td>{done}/{qs.length}</td><td>{Math.round(done/qs.length*100)}%</td>','dashboard guru');
 changed.set('app/components/StaffPanel.tsx',s);
}

// Server-side gate mirrors the client-side 3/3 rule.
{
 let s=load('app/api/progress/route.ts');
 s=replaceOnce(s,'Selesaikan minimal 80% materi sebelumnya terlebih dahulu.','Selesaikan seluruh 3 soal pada materi sebelumnya terlebih dahulu (3/3).','validasi server 3/3');
 changed.set('app/api/progress/route.ts',s);
}

// Curriculum test: exact count, unique sentences, structural variety, and strict 3/3 unlocking.
changed.set('scripts/check-curriculum.mjs',`import ts from 'typescript';
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const code=ts.transpileModule(fs.readFileSync('data/curriculum.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const mod={exports:{}};vm.runInNewContext(code,{exports:mod.exports,module:mod});
const c=mod.exports;
assert.equal(c.topics.length,22);
assert.equal(c.learningQuestions.length,66);
assert.equal(new Set(c.learningQuestions.map(q=>q.id)).size,66);
const normalize=s=>s.replace(/[ًٌٍَُِّْٰـ]/g,'').replace(/\s+/g,' ').trim();
assert.equal(new Set(c.learningQuestions.map(q=>normalize(q.sentence))).size,66,'All 66 sentences must be distinct, including without harakat');
for(const topic of c.topics)assert.equal(c.learningQuestions.filter(q=>q.topic===topic).length,3,topic+' must have exactly 3 questions');
const structures=new Set(c.learningQuestions.map(q=>q.structure));
assert.ok(structures.has('Jumlah ismiyyah'),'The bank must contain nominal sentences');
assert.ok(structures.has('Jumlah fi‘liyyah'),'The bank must contain verbal sentences');
const nominal=c.learningQuestions.filter(q=>q.structure!=='Jumlah fi‘liyyah').length;
const verbal=c.learningQuestions.filter(q=>q.structure==='Jumlah fi‘liyyah').length;
assert.equal(nominal,34,'Bank should include 34 nominal sentence structures, including nāsikh and verbal predicates');
assert.equal(verbal,32,'Bank should include 32 verbal sentence structures');
assert.equal(c.learningQuestions.filter(q=>q.structure==='Jumlah ismiyyah').length,21);
assert.equal(c.learningQuestions.filter(q=>q.structure==='Jumlah ismiyyah dengan khabar fi‘liyyah').length,7);
assert.equal(c.learningQuestions.filter(q=>q.structure==='Jumlah ismiyyah dengan nāsikh').length,6);
const complete=[];
for(const [ti,topic] of c.topics.entries()){
 const questions=c.learningQuestions.filter(q=>q.topic===topic);
 assert.equal(c.topicUnlocked(topic,complete),true,'Current topic should be unlocked after previous topic 3/3');
 const next=c.topics[ti+1];
 for(const [qi,q] of questions.entries()){
  assert.equal(q.sentence,q.words.map(w=>w.token).join(' '));
  for(const [i,w] of q.words.entries()){
   assert.ok(w.explanation&&w.fullIrab);
   const answer=c.expectedAnswer(q,i);
   assert.equal(c.gradeAnswer(q,i,answer),true,'Correct key must pass: '+q.sentence);
   assert.equal(c.gradeAnswer(q,i,{...answer,kind:''}),false,'Incomplete answer must fail: '+q.sentence);
   complete.push(q.id+':'+i);
  }
  if(next&&qi<2)assert.equal(c.topicUnlocked(next,complete),false,'Two questions are not enough to unlock the next topic');
 }
 if(next)assert.equal(c.topicUnlocked(next,complete),true,'All 3 questions must unlock the next topic');
}
assert.equal(c.topicUnlocked('unknown',complete),false);
console.log('PASS: 22 subtopics; exactly 3 questions each (66 total); 34 nominal structures and 32 verbal structures; 66 unique sentences; answer keys and strict 3/3 unlocking.');
`);

// Project documentation.
{
 let s=load('README.md');
 s=replaceOnce(s,'# Irab Labs — v0.7.0','# Irab Labs — v0.7.1','README version');
 s=replaceOnce(s,'- 110 kalimat berbeda untuk 22 submateri; 5 soal per materi.','- 66 kalimat berbeda untuk 22 submateri; 3 soal per materi.','README jumlah soal');
 s=replaceOnce(s,'- Tahap dasar bertingkat; analisis setiap kata dengan kunci terstruktur.','- Komposisi kalimat: 34 jumlah ismiyyah (termasuk nāsikh dan khabar fi‘liyyah) serta 32 jumlah fi‘liyyah.\n- Tahap dasar bertingkat; analisis setiap kata dengan kunci terstruktur.','README variasi struktur');
 s=replaceOnce(s,'- Penguasaan 80% membuka materi berikutnya; soal dan materi yang sudah terbuka bisa direview kembali.','- Ketiga soal (3/3, 100%) wajib benar untuk membuka materi berikutnya; soal dan materi yang sudah terbuka bisa direview kembali.','README aturan buka materi');
 s=s.replace('Penyimpanan browser dipisahkan per UUID akun dan versi kurikulum.','Penyimpanan browser dipisahkan per UUID akun dan versi kurikulum. Bank 3 soal per submateri memakai versi `v071`; progres `v070` tetap tersimpan terpisah.');
 changed.set('README.md',s);
}
{
 const s=[
 '# Pembaruan bank soal Irab Labs v0.7.1',
 '',
 'Pembaruan ini mengganti bank latihan menjadi 3 soal per submateri dan mengaktifkan syarat kelulusan 3/3. Ini patch untuk source project yang sudah ada, bukan ZIP source lengkap.',
 '',
 '## Langkah aman',
 '',
 '1. Buat backup repository GitHub dan simpan salinan folder proyek lokal sebelum mengubah apa pun.',
 '2. Unduh ZIP repository Irab Labs dari GitHub, lalu ekstrak ke komputer.',
 '3. Ekstrak ZIP patch ke folder utama proyek yang berisi package.json.',
 '4. Di Windows, klik dua kali JALANKAN-PATCH-WINDOWS.bat. Atau buka terminal di folder utama proyek dan jalankan node apply-irab-patch.mjs.',
 '5. Pastikan terminal menampilkan pesan berhasil memasang patch. File lama dicadangkan di .irab-patch-backup-v071.',
 '6. Jalankan pemeriksaan berikut dari folder proyek:',
 '',
 '   npm ci',
 '   npm run test:curriculum',
 '   npm run typecheck',
 '   npm run lint',
 '   npm run build',
 '',
 '7. Jika semua pemeriksaan lulus, unggah file proyek yang berubah ke GitHub pada path yang sama. Jangan unggah ZIP patch sebagai satu file, folder backup, .env.local, node_modules, atau .next.',
 '8. Commit ke branch main. Vercel akan deploy otomatis jika integrasi GitHub aktif. Periksa hasil deployment sebelum membagikan situs.',
 '',
 '## Perubahan bank soal',
 '',
 '- 22 submateri × 3 soal = 66 soal aktif.',
 '- Komposisi: 34 jumlah ismiyyah (termasuk nāsikh dan khabar fi‘liyyah) serta 32 jumlah fi‘liyyah.',
 '- Setiap soal diberi label struktur kalimat.',
 '- Kalimat diperbarui agar tidak hanya mengulang pola atau mengganti satu-dua kosakata.',
 '- Semua 3 soal harus dikuasai (3/3 atau 100%) untuk membuka submateri berikutnya.',
 '',
 '## Data lama dan Supabase',
 '',
 '- Bank baru memakai versi kurikulum v071. Progres v070 tidak dihapus dari database/browser, tetapi disimpan terpisah dan tidak otomatis dihitung untuk bank baru.',
 '- Tidak perlu menjalankan migrasi SQL Supabase baru. Tetap gunakan proyek Supabase yang sama.',
 '- Akun siswa, guru, admin, dan data kotak saran tidak dihapus.',
 '- Jangan mengubah atau mengunggah kredensial seperti .env.local atau SUPABASE_SERVICE_ROLE_KEY ke GitHub.',
 '',
 'Jika installer berhenti dengan pesan error, jangan unggah perubahan parsial. Simpan pesan errornya untuk diperiksa terlebih dahulu.'
 ].join('\n');
 changed.set('MULAI_DI_SINI.md',s);
}

changed.set('VALIDASI.md',[
 '# Validasi pembaruan Irab Labs v0.7.1',
 '',
 '## Pemeriksaan bank soal',
 '',
 '- 22 submateri.',
 '- Tepat 3 soal per submateri; total 66 soal aktif.',
 '- 66 kalimat unik setelah harakat diabaikan.',
 '- Komposisi: 34 jumlah ismiyyah (termasuk nāsikh dan khabar fi‘liyyah) serta 32 jumlah fi‘liyyah.',
 '- Kunci jawaban dan pembukaan materi diuji melalui npm run test:curriculum.',
 '- Aturan pembukaan: 2/3 soal belum cukup; 3/3 soal harus tuntas.',
 '',
 '## Pemeriksaan yang wajib dijalankan pada salinan proyek',
 '',
 'Jalankan dari root proyek:',
 '',
 'npm ci',
 'npm run test:curriculum',
 'npm run typecheck',
 'npm run lint',
 'npm run build',
 '',
 'Paket ini tidak mengklaim build produksi atau integrasi Supabase/Vercel sudah diuji pada akun pemilik. Jalankan pemeriksaan di atas sebelum menggabungkan perubahan ke branch produksi.',
 '',
 '## Riwayat dan kompatibilitas',
 '',
 'Bank baru menggunakan CURRICULUM_VERSION v071. Progres v070 tidak dihapus, tetapi tetap terpisah dan tidak dianggap sebagai penguasaan soal baru. Tidak diperlukan migrasi SQL baru untuk perubahan bank soal ini.'
].join('\\n'));

// Validate every replacement before writing any file.
if(changed.size!==8)throw new Error('Jumlah file patch tidak sesuai: '+changed.size);
if(!changed.get('data/curriculum.ts').includes('learningQuestions'))throw new Error('Bank soal baru tidak ditemukan.');
if(changed.get('app/page.tsx').includes('80%')||changed.get('app/page.tsx').includes('4 dari 5 soal'))throw new Error('UI masih memuat aturan kelulusan lama.');

// Preserve originals in a local backup folder before replacing them.
const backupDir=path.join(root,'.irab-patch-backup-v071');
fs.mkdirSync(backupDir,{recursive:true});
for(const [file,content] of changed){
 const target=path.join(root,file);
 fs.mkdirSync(path.dirname(target),{recursive:true});
 if(fs.existsSync(target))fs.copyFileSync(target,path.join(backupDir,file.replaceAll('/','__')));
 fs.writeFileSync(target,content,'utf8');
}
console.log('Berhasil memasang patch v0.7.1: 66 soal aktif, 3 soal per submateri, 34 struktur jumlah ismiyyah, 32 jumlah fi‘liyyah, dan syarat 3/3.');
console.log('File yang diperbarui: '+[...changed.keys()].join(', '));
const obsolete=path.join(root,'apply-3of3-patch.mjs');
if(fs.existsSync(obsolete))fs.unlinkSync(obsolete);
console.log('Installer patch lama apply-3of3-patch.mjs telah dibersihkan jika ada.');
console.log('Backup file lama disimpan di .irab-patch-backup-v071.');
console.log('Lanjutkan dengan: npm ci && npm run test:curriculum && npm run typecheck && npm run lint && npm run build');
