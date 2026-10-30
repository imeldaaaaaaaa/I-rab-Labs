import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const files=['package.json','data/curriculum.ts','app/page.tsx','app/api/progress/route.ts','app/api/students/route.ts','lib/use-learning-progress.ts','app/components/StaffPanel.tsx','scripts/check-curriculum.mjs','README.md','MULAI_DI_SINI.md','VALIDASI.md'];
for(const f of files)if(!fs.existsSync(path.join(root,f)))throw Error('File tidak ditemukan: '+f+'. Jalankan dari root proyek Irab Labs.');
if(JSON.parse(fs.readFileSync('package.json','utf8')).name!=='bedah-irab')throw Error('Folder ini bukan proyek Bedah I\'rab.');
const out=new Map();
function edit(file,fn){out.set(file,fn(fs.readFileSync(file,'utf8')));}
function exact(s,a,b,label){const n=s.split(a).length-1;if(n!==1)throw Error('Patch gagal ('+label+'): target ditemukan '+n+' kali. Tidak ada file yang diubah.');return s.replace(a,b);}

edit('data/curriculum.ts',s=>{
 const block=/export const learningQuestions:LearningExercise\[\]=rows\.flatMap\(\(group,ti\)=>group\.map\(\(\[translation,words\],qi\)=>\(\{[\s\S]*?\}\)\)\);/;
 if(!block.test(s))throw Error('Bank soal lama tidak ditemukan.');
 s=s.replace(block,`// Tiga soal dipilih untuk tiap submateri. ID soal sumber dipertahankan agar
// progres pada kalimat yang tetap digunakan tidak hilang.
const selectedQuestionIndexes:Record<number,number[]> = {
 5:[0,1,3],  // khabar mufrad, syibh jumlah, dan jumlah fi‘liyyah
 9:[0,1,4],  // fi‘il aktif, pasif māḍī, dan pasif muḍāri‘
 17:[0,1,4]  // مِنْ، إِلَى، dan بِ
};
export const learningQuestions:LearningExercise[]=rows.flatMap((group,ti)=>{
 const selected=selectedQuestionIndexes[ti]??[0,1,2];
 return selected.map((sourceIndex,order)=>{
  const [translation,words]=group[sourceIndex];
  return {
   id:CURRICULUM_VERSION+'-'+ti+'-'+sourceIndex,
   source:'Umum',
   title:topics[ti]+' — Soal '+(order+1),
   sentence:words.map(w=>w.token).join(' '),
   translation,
   topic:topics[ti],
   words,
   context:'Fokus: '+topics[ti]+'. Analisis setiap kata. Huruf yang menempel ditampilkan terpisah untuk latihan.',
   reference:''
  };
 });
});`);
 return exact(s,
  "export function topicUnlocked(topic:string,completed:string[]){const ti=topics.indexOf(topic);return ti>=0&&topics.slice(0,ti).every(t=>learningQuestions.filter(q=>q.topic===t).filter(q=>q.words.every((_,i)=>completed.includes(`${q.id}:${i}`))).length>=4);}",
  "export function topicUnlocked(topic:string,completed:string[]){const ti=topics.indexOf(topic);return ti>=0&&topics.slice(0,ti).every(t=>{const previous=learningQuestions.filter(q=>q.topic===t);return previous.length===3&&previous.every(q=>q.words.every((_,i)=>completed.includes(`${q.id}:${i}`)));});}",
  'syarat buka materi 3/3');
});

edit('app/page.tsx',s=>{
 const scoreBlock=/^  const score=.*?(?=^ }\n)/ms;
 if(!scoreBlock.test(s))throw Error('Blok perhitungan nilai tidak ditemukan.');
 s=s.replace(scoreBlock,`  const score=available.filter(e=>e.words.every((_,i)=>completed.includes(e.id+':'+i))).length;
  const percentage=Math.round(score/available.length*100);
  const allCorrect=score===available.length;
  const topicList=lessonGroups.flatMap(g=>g.topics);const topicIndex=topicList.indexOf(selectedTopic);
  if(allCorrect&&topicIndex<topicList.length-1){const nextTopic=topicList[topicIndex+1];setSelectedTopic(nextTopic);chooseExercise(learningQuestions.find(e=>e.topic===nextTopic)!);setNotice('Keren! Nilaimu '+percentage+'%. Semua soal benar, materi berikutnya terbuka.');setCelebration({kind:'topic',title:'MASYAALLAH, LEVEL UP! 🌟',message:'Kamu mendapat nilai '+percentage+'% dan berhasil membuka materi “'+nextTopic+'”. Yuk, lanjutkan perjalanan belajarmu!'});}
  else if(topicIndex===topicList.length-1&&allCorrect){setNotice('Selamat! Kamu menyelesaikan seluruh jalur belajar Bedah I‘rab.');setCelebration({kind:'finish',title:'LUAR BIASA, KAMU TAMAT! 🏆',message:'MasyaAllah! Kamu sudah menuntaskan seluruh jalur belajar. Semoga ilmu Nahwunya makin melekat!'});}
  else{const retry=available.find(e=>!e.words.every((_,i)=>completed.includes(e.id+':'+i)));if(retry){chooseExercise(retry);setNotice('Nilai materi ini '+percentage+'%. Semua '+available.length+' soal wajib benar; targetnya 3/3 (100%). Ulangi soal yang belum benar, ya.');}}
`);
 s=exact(s,"SOAL {String(available.findIndex(e=>e.id===exercise.id)+1).padStart(2,'0')} / 05","SOAL {String(available.findIndex(e=>e.id===exercise.id)+1).padStart(2,'0')} / {String(available.length).padStart(2,'0')}",'nomor soal');
 s=exact(s,"{available.findIndex(e=>e.id===exercise.id)===4?'Nilai & lanjut materi →':'Soal berikutnya →'}","{available.findIndex(e=>e.id===exercise.id)===available.length-1?'Nilai & lanjut materi →':'Soal berikutnya →'}",'tombol soal terakhir');
 s=exact(s,'Kerjakan soal sesuai urutan. Materi selanjutnya terbuka setelah minimal 4 dari 5 soal dijawab benar (80%). Materi yang sudah terbuka dapat dikunjungi kembali untuk review.','Kerjakan soal sesuai urutan. Materi selanjutnya terbuka setelah semua 3 soal dijawab benar (3/3 atau 100%). Materi yang sudah terbuka dapat dikunjungi kembali untuk review.','petunjuk jalur belajar');
 s=exact(s,'Materi disusun berurutan. Setiap submateri berisi 5 soal; nilai minimal 80% diperlukan untuk membuka submateri berikutnya. Contoh ayat Al-Qur’an tidak digunakan dalam bank latihan.','Materi disusun berurutan. Setiap submateri berisi 3 soal; ketiganya wajib dijawab benar (3/3 atau 100%) untuk membuka submateri berikutnya. Contoh ayat Al-Qur’an tidak digunakan dalam bank latihan.','deskripsi materi');
 s=exact(s,'5 soal per submateri','3 soal per submateri','label jumlah soal');
 s=exact(s,'<p>{done}/5 soal dikuasai · {done*20}%</p>','<p>{done}/{qs.length} soal dikuasai · {Math.round(done/qs.length*100)}%</p>','progres materi');
 const count=/\{available\.filter\(e=>e\.words\.every\(\(_,i\)=>completed\.includes\(`\$\{e\.id\}:\$\{i\}`\)\)\)\.length\}\/5 soal benar/;
 if(!count.test(s))throw Error('Penghitung 5 soal tidak ditemukan.');
 s=s.replace(count,'{available.filter(e=>e.words.every((_,i)=>completed.includes(`${e.id}:${i}`))).length}/{available.length} soal benar');
 for(const marker of ['score>=4','score*20','4 dari 5','80%','/ 05','===4?','/5 soal benar','5 soal per submateri','done*20'])if(s.includes(marker))throw Error('Aturan lama masih tersisa: '+marker);
 return s;
});

edit('app/api/progress/route.ts',s=>exact(s,'Selesaikan minimal 80% materi sebelumnya terlebih dahulu.','Selesaikan seluruh soal pada materi sebelumnya terlebih dahulu.','pesan kunci materi'));

edit('app/api/students/route.ts',s=>{
 s=exact(s,"import { CURRICULUM_VERSION } from '@/data/curriculum';","import { CURRICULUM_VERSION,learningQuestions } from '@/data/curriculum';",'import soal aktif');
 const old=/ const \{data:stats,error:statsError\}=await ctx\.db\.rpc\('irab_student_summaries',[\s\S]*?return Response\.json\(\{students:students\.map\(s=>\(\{\.\.\.s,\.\.\.\(stats as \{student_id:string\}\[\]\)\?\.find\(r=>r\.student_id===s\.id\)\}\)\),count:count\?\?0,page\},\{headers:noStore\}\);/;
 if(!old.test(s))throw Error('Blok ringkasan dashboard tidak ditemukan.');
 return s.replace(old,` const stats:{student_id:string;completed:boolean;attempts:number;updated_at:string}[]=[];
 for(let offset=0;;offset+=1000){
  const {data,error:statsError}=await ctx.db.from('irab_word_progress').select('student_id,completed,attempts,updated_at').eq('curriculum_version',CURRICULUM_VERSION).in('student_id',students.map(s=>s.id)).in('question_id',learningQuestions.map(q=>q.id)).range(offset,offset+999);
  if(statsError)return Response.json({error:'Ringkasan progres belum tersedia.'},{status:500});
  stats.push(...(data||[]) as typeof stats);
  if(!data||data.length<1000)break;
 }
 const summary=new Map<string,{correct_words:number;attempts:number;last_active:string}>();
 for(const r of stats){
  const item=summary.get(r.student_id)||{correct_words:0,attempts:0,last_active:''};
  if(r.completed)item.correct_words+=1;
  item.attempts+=Number(r.attempts)||0;
  if(r.updated_at>item.last_active)item.last_active=r.updated_at;
  summary.set(r.student_id,item);
 }
 return Response.json({students:students.map(s=>({...s,...(summary.get(s.id)||{correct_words:0,attempts:0,last_active:undefined})})),count:count??0,page},{headers:noStore});`);
});

edit('lib/use-learning-progress.ts',s=>{
 s=exact(s,"function read(key:string):Cache{try{const v=JSON.parse(localStorage.getItem(key)||'null');return v&&v.records&&Array.isArray(v.pending)?v:empty();}catch{return empty();}}",`const activeQuestionIds=new Set(learningQuestions.map(q=>q.id));
const activeWordKeys=learningQuestions.flatMap(q=>q.words.map((_,i)=>q.id+':'+i));
function read(key:string):Cache{try{const v=JSON.parse(localStorage.getItem(key)||'null');return v&&v.records&&Array.isArray(v.pending)?{records:v.records,pending:v.pending.filter((p:Pending)=>activeQuestionIds.has(p.questionId))}:empty();}catch{return empty();}}`,'filter cache lokal');
 return exact(s,'completed:Object.entries(cache.records).filter(([,r])=>r.completed).map(([k])=>k)','completed:activeWordKeys.filter(k=>cache.records[k]?.completed)','hitung progres soal aktif');
});

edit('app/components/StaffPanel.tsx',s=>exact(s,'<td>{done}/5</td><td>{done*20}%</td>','<td>{done}/{qs.length}</td><td>{Math.round(done/qs.length*100)}%</td>','progres dashboard guru'));

const test=`import ts from 'typescript';
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const code=ts.transpileModule(fs.readFileSync('data/curriculum.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const mod={exports:{}};vm.runInNewContext(code,{exports:mod.exports,module:mod});
const c=mod.exports;
assert.equal(c.topics.length,22);
assert.equal(c.learningQuestions.length,66);
assert.equal(new Set(c.learningQuestions.map(q=>q.id)).size,66);
assert.equal(new Set(c.learningQuestions.map(q=>q.sentence.replace(/[ًٌٍَُِّْٰـ]/g,''))).size,66,'All sentences must be distinct, including across topics');
const complete=[];
for(const [ti,t] of c.topics.entries()){
 const questions=c.learningQuestions.filter(q=>q.topic===t);
 assert.equal(questions.length,3,t+' must have exactly 3 questions');
 assert.equal(c.topicUnlocked(t,complete),true);
 const nextTopic=c.topics[ti+1];
 if(nextTopic)assert.equal(c.topicUnlocked(nextTopic,complete),false,'Next topic must remain locked before 3/3');
 for(const [qi,q] of questions.entries()){
  assert.equal(q.sentence,q.words.map(w=>w.token).join(' '));
  for(const [i,w] of q.words.entries()){
   assert.ok(w.explanation&&w.fullIrab);
   const answer=c.expectedAnswer(q,i);assert.equal(c.gradeAnswer(q,i,answer),true);
   assert.equal(c.gradeAnswer(q,i,{...answer,kind:''}),false);
   complete.push(q.id+':'+i);
  }
  if(nextTopic&&qi<2)assert.equal(c.topicUnlocked(nextTopic,complete),false,'Two completed questions are not enough');
 }
 if(nextTopic)assert.equal(c.topicUnlocked(nextTopic,complete),true,'All 3 completed questions must unlock the next topic');
}
assert.equal(c.topicUnlocked('unknown',complete),false);
console.log('PASS: 22 topics, 66 globally unique sentences, '+c.learningQuestions.reduce((n,q)=>n+q.words.length,0)+' graded words, foundation stages, and strict 3/3 sequential unlocks.');
`;
out.set('scripts/check-curriculum.mjs',test);

edit('README.md',s=>{
 s=exact(s,'- 110 kalimat berbeda untuk 22 submateri; 5 soal per materi.','- 66 kalimat berbeda untuk 22 submateri; 3 soal per materi.','jumlah soal README');
 return exact(s,'- Penguasaan 80% membuka materi berikutnya; soal dan materi yang sudah terbuka bisa direview kembali.','- Ketiga soal (3/3, 100%) wajib benar untuk membuka materi berikutnya; soal dan materi yang sudah terbuka bisa direview kembali.','aturan 3/3 README');
});


const startGuide=`# Pembaruan aturan kelulusan 3/3 — Irab Labs

Dokumen ini menyertai patch 3/3. ZIP patch bukan salinan penuh proyek; terapkan pada salinan repository Irab Labs yang sudah diekstrak.

## Cara menerapkan

1. Cadangkan folder proyek dan database Supabase.
2. Ekstrak ZIP repository Irab Labs dari GitHub ke komputer.
3. Ekstrak ZIP patch ini ke root proyek (folder yang berisi package.json), lalu izinkan file patch menimpa jika diminta.
4. Jalankan perintah dari root proyek:

   \`\`\`bash
   node apply-3of3-patch.mjs
   npm ci
   npm run test:curriculum
   npm run typecheck
   npm run lint
   npm run build
   \`\`\`

5. Jika semua pemeriksaan lulus, commit file yang berubah ke branch produksi GitHub. Deploy melalui alur hosting yang biasa digunakan.

## Aturan baru

- Ada 22 submateri dengan 3 soal terpilih per submateri: total 66 soal.
- Semua 3 soal harus dikuasai (3/3 = 100%) untuk membuka submateri berikutnya.
- Satu soal dianggap dikuasai setelah seluruh kata di dalam kalimatnya berhasil dijawab benar.
- Soal yang sudah terbuka tetap dapat di-review.
- ID untuk tiga soal yang dipertahankan tetap sama. Progres pada soal terpilih dipertahankan; catatan untuk dua soal yang tidak lagi aktif tidak dihitung dalam skor baru.

## Database dan keamanan

Patch ini tidak memerlukan migrasi Supabase baru. Versi kurikulum tetap v070 agar progres soal yang dipertahankan tetap cocok dengan ID lama. Jangan mengubah atau membagikan \`.env.local\`, anon key privat, atau service role key. Uji login dan sinkronisasi pada lingkungan milik Anda setelah deploy.
`;
out.set('MULAI_DI_SINI.md',startGuide);
const validationGuide=`# Validasi patch 3/3 — Irab Labs

Patch ini mengubah aturan kurikulum menjadi 3 soal per submateri dan syarat kelulusan 3/3 (100%). ZIP dibuat sebagai patch overlay untuk repository yang sudah ada, bukan salinan lengkap aplikasi.

## Pemeriksaan setelah menerapkan patch

Jalankan dari root repository:

\`\`\`bash
npm run test:curriculum
npm run typecheck
npm run lint
npm run build
\`\`\`

Test kurikulum yang diperbarui memeriksa 22 submateri, 66 soal unik, kunci jawaban, dan bahwa dua soal belum cukup untuk membuka materi berikutnya. Build, lint, typecheck, integrasi Supabase, dan deployment belum dijalankan oleh patch ini; hasilnya harus diperiksa pada salinan proyek dan lingkungan pemilik.

## Catatan kompatibilitas

- ID soal terpilih dipertahankan dan versi kurikulum tetap v070.
- Riwayat pada soal yang tetap digunakan dapat dipertahankan.
- Dua soal per submateri yang tidak lagi dipilih tetap ada pada data lama di database, tetapi tidak dihitung dalam progres aktif.
- Tidak ada tabel, akun, atau riwayat database yang dihapus. Tidak diperlukan migrasi SQL baru.
- Kunci latihan dan analisis Nahwu tetap perlu ditinjau pengajar sebelum digunakan untuk asesmen formal.
`;
out.set('VALIDASI.md',validationGuide);

if(!out.get('data/curriculum.ts').includes('previous.length===3'))throw Error('Validasi aturan kurikulum 3/3 gagal.');
for(const [file,content] of out)fs.writeFileSync(path.join(root,file),content,'utf8');
console.log('Berhasil menerapkan aturan 3/3 (100%) pada '+out.size+' file.');
console.log('Jalankan: npm run test:curriculum && npm run typecheck && npm run lint && npm run build');
