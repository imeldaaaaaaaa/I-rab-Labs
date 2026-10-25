"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { exercises, positions, wordKinds, caseStates, signs, type Exercise, type WordKind, type CaseState, type Sign } from '@/data/exercises';
import { supabase } from '@/lib/supabase/client';

type Role = 'Siswa' | 'Guru' | 'Admin';
type User = { name: string; role: Role; email: string };
type Answer = { kind: WordKind | ''; position: string; state: CaseState | ''; sign: Sign | ''; wordClass?: 'Mu‘rab' | 'Mabnī' | ''; definiteness?: 'Ma‘rifah' | 'Nakirah' | 'Tidak berlaku' | ''; number?: 'Mufrad' | 'Tatsniyah' | 'Jamak' | 'Tidak berlaku' | '' };
type ProgressRecord = { user: User; correct: number; attempts: number; completed: string[]; updatedAt: string };
type TeacherApplication = { id: string; full_name: string; email: string; institution: string; experience: string; motivation: string; status: 'pending' | 'processing' | 'approved' | 'rejected'; created_at: string };
const blank: Answer = { kind: '', position: '', state: '', sign: '', wordClass: '', definiteness: '', number: '' };
const lessonGroups = [
 {title:'Dasar-dasar kalimah',desc:'Kenali jenis kata dan sifatnya.',topics:['Isim, fi‘il, huruf','Mu‘rab dan mabnī','Ma‘rifah dan nakirah','Mufrad, mutsanna, jamak']},
 {title:'Jumlah ismiyyah',desc:'Susunan kalimat yang diawali isim.',topics:['Mubtada’ dan khabar','Khabar mufrad, jumlah, syibh jumlah','Kāna wa akhawātuhā','Inna wa akhawātuhā']},
 {title:'Jumlah fi‘liyyah',desc:'Fi‘il, pelaku, objek, dan pelengkap.',topics:['Fi‘il māḍī, muḍāri‘, amr','Fā‘il dan nā’ib al-fā‘il','Maf‘ūl bih','Maf‘ūl muṭlaq, li-ajlih, fīh']},
 {title:'Tawābi‘ dan struktur isim',desc:'Kata yang mengikuti kata lain.',topics:['Na‘t dan man‘ūt','‘Aṭaf dan ma‘ṭūf','Taukīd','Badal','Muḍāf dan muḍāf ilaih']},
 {title:'Huruf dan i‘rab lanjutan',desc:'Pengaruh amil pada kata sesudahnya.',topics:['Huruf jar dan isim majrūr','Fi‘il muḍāri‘ manṣūb','Fi‘il muḍāri‘ majzūm','Ḥāl dan tamyīz','Istitsnā’ dan munādā']}
];
function topicMatches(e:Exercise, topic:string){
 const text=(e.title+' '+e.topic).toLocaleLowerCase();
 const aliases:Record<string,string[]>={
  'Isim, fi‘il, huruf':['fi‘il','huruf','jumlah','mubtada’'], 'Mu‘rab dan mabnī':['mabnī','marfū‘','manṣūb','majrūr','majzūm'],
  'Ma‘rifah dan nakirah':['nakirah','ma‘rifah'], 'Mufrad, mutsanna, jamak':['mutsanna','jamak','mufrad'],
  'Mubtada’ dan khabar':['mubtada’','khabar'], 'Khabar mufrad, jumlah, syibh jumlah':['khabar'],
  'Kāna wa akhawātuhā':['kāna','isim-khabarnya'], 'Inna wa akhawātuhā':['inna','isim-khabarnya'],
  'Fi‘il māḍī, muḍāri‘, amr':['fi‘il','muḍāri‘'], 'Fā‘il dan nā’ib al-fā‘il':['fā‘il','nā’ib al-fā‘il'],
  'Maf‘ūl bih':['maf‘ūl bih','maf‘ūl'], 'Maf‘ūl muṭlaq, li-ajlih, fīh':['maf‘ūl','ẓarf'],
  'Na‘t dan man‘ūt':['na‘t','man‘ūt'], '‘Aṭaf dan ma‘ṭūf':['‘aṭaf','ma‘ṭūf'], 'Taukīd':['taukīd'], 'Badal':['badal'],
  'Muḍāf dan muḍāf ilaih':['muḍāf','iḍāfah'], 'Huruf jar dan isim majrūr':['jar','majrūr'],
  'Fi‘il muḍāri‘ manṣūb':['manṣūb','لن'], 'Fi‘il muḍāri‘ majzūm':['majzūm','لم'],
  'Ḥāl dan tamyīz':['ḥāl','tamyīz'], 'Istitsnā’ dan munādā':['istitsnā','munādā']
 };
 const keys=aliases[topic]||[topic.toLocaleLowerCase()]; return keys.some(k=>text.includes(k));
}
const targetPositions: Record<string, string[]> = {
 'Isim, fi‘il, huruf':['Mubtada’','Fi‘il māḍī','Huruf jar'],
 'Mu‘rab dan mabnī':['Fi‘il māḍī','Mubtada’','Isim majrūr'],
 'Ma‘rifah dan nakirah':['Mubtada’','Fā‘il','Maf‘ūl bih'],
 'Mufrad, mutsanna, jamak':['Mubtada’','Fā‘il','Maf‘ūl bih'],
 'Mubtada’ dan khabar':['Mubtada’','Khabar'],
 'Khabar mufrad, jumlah, syibh jumlah':['Khabar','Khabar إنّ','Khabar كان'],
 'Kāna wa akhawātuhā':['Isim كان','Khabar كان','Fi‘il nāqiṣ'],
 'Inna wa akhawātuhā':['Isim إنّ','Khabar إنّ','Huruf nāsikh'],
 'Fi‘il māḍī, muḍāri‘, amr':['Fi‘il māḍī','Fi‘il muḍāri‘'],
 'Fā‘il dan nā’ib al-fā‘il':['Fā‘il','Nā’ib al-fā‘il'],
 'Maf‘ūl bih':['Maf‘ūl bih'],
 'Maf‘ūl muṭlaq, li-ajlih, fīh':['Maf‘ūl bih','Ẓarf makān'],
 'Na‘t dan man‘ūt':['Na‘t'],
 '‘Aṭaf dan ma‘ṭūf':['Ma‘ṭūf','Huruf ‘aṭaf'],
 'Taukīd':['Mubtada’','Fā‘il'],
 'Badal':['Badal'],
 'Muḍāf dan muḍāf ilaih':['Muḍāf ilaih','Mubtada’'],
 'Huruf jar dan isim majrūr':['Isim majrūr','Huruf jar'],
 'Fi‘il muḍāri‘ manṣūb':['Fi‘il muḍāri‘'],
 'Fi‘il muḍāri‘ majzūm':['Fi‘il muḍāri‘'],
 'Ḥāl dan tamyīz':['Ḥāl'],
 'Istitsnā’ dan munādā':['Isim majrūr','Maf‘ūl bih']
};
function buildLearningQuestions(): Exercise[] {
 const topics=lessonGroups.flatMap(group=>group.topics);
 const result: Exercise[]=[];
 topics.forEach((topic,topicIndex)=>{
  const desired=targetPositions[topic]||[];
  let candidates=exercises.filter(e=>topicMatches(e,topic));
  if(!candidates.length) candidates=exercises;
  const matching=candidates.filter(seed=>seed.words.some(word=>desired.some(d=>word.position.toLocaleLowerCase().includes(d.toLocaleLowerCase()))));
  const uniqueBySentence=(items:Exercise[])=>items.filter((item,index)=>items.findIndex(other=>other.sentence===item.sentence)===index);
  let questionSeeds=uniqueBySentence(matching.length?matching:candidates);
  if(questionSeeds.length<5){
   const extras=uniqueBySentence(candidates).filter(item=>!questionSeeds.some(seed=>seed.sentence===item.sentence));
   questionSeeds=[...questionSeeds,...extras];
  }
  if(questionSeeds.length<5){
   const extras=uniqueBySentence(exercises).filter(item=>!questionSeeds.some(seed=>seed.sentence===item.sentence));
   questionSeeds=[...questionSeeds,...extras];
  }
  for(let i=0;i<5;i++){
   const seed=questionSeeds[i];
   result.push({...seed,id:`q-${topicIndex}-${i}`,title:`${topic} — Soal ${String(i+1).padStart(2,'0')}`,topic,words:seed.words,reference:'',context:`Fokus soal: ${topic}. Analisis setiap kata dalam kalimat ini satu per satu. Soal dihitung benar jika seluruh kata dianalisis dengan tepat.`});
  }
 });
 return result;
}
const learningQuestions = buildLearningQuestions();
const foundationTopics = lessonGroups[0].topics;
type FoundationStage = 1 | 2 | 3 | 4 | 5;
function getFoundationStage(topic: string): FoundationStage {
 const index = foundationTopics.indexOf(topic);
 return index < 0 ? 5 : (index + 1) as FoundationStage;
}
function expectedState(word: Exercise['words'][number]): CaseState {
 return word.kind === 'Huruf' || word.state === 'Tidak berlaku' ? 'Mabnī' : word.state;
}
function expectedWordClass(word: Exercise['words'][number]): 'Mu‘rab' | 'Mabnī' {
 return expectedState(word) === 'Mabnī' ? 'Mabnī' : 'Mu‘rab';
}
function expectedDefiniteness(word: Exercise['words'][number]): 'Ma‘rifah' | 'Nakirah' | 'Tidak berlaku' {
 if (word.kind !== 'Isim') return 'Tidak berlaku';
 const token = word.token.replace(/[ًٌٍَُِّْٰـ]/g, '');
 const properNames = ['مُحَمَّدٌ','مُحَمَّدًا','مُحَمَّدٍ','زَيْدٌ','زَيْدًا','زَيْدٍ','عَلِيٌّ','عَلِيًّا','عَلِيٍّ','فَاطِمَةُ','فَاطِمَةَ','فَاطِمَةِ','عَمْرٌو','عَمْرًا','عَمْرٍ'];
 if (token.startsWith('ال') || properNames.includes(word.token)) return 'Ma‘rifah';
 if (/[ًٌٍ]$/.test(word.token)) return 'Nakirah';
 if (['هَذَا','هَذِهِ','هَؤُلَاءِ','ذَلِكَ','تِلْكَ','أَنَا','نَحْنُ','أَنْتَ','هُوَ','هِيَ'].includes(word.token)) return 'Ma‘rifah';
 return 'Nakirah';
}
function expectedNumber(word: Exercise['words'][number]): 'Mufrad' | 'Tatsniyah' | 'Jamak' | 'Tidak berlaku' {
 if (word.kind !== 'Isim') return 'Tidak berlaku';
 const token = word.token.replace(/[ًٌٍَُِّْٰـ]/g, '');
 if (/(ان|ين|تان|تين)$/.test(token)) return 'Tatsniyah';
 if (/(ون|ين|ات)$/.test(token)) return 'Jamak';
 return 'Mufrad';
}
function Icon({children}:{children:ReactNode}) { return <span className="icon" aria-hidden="true">{children}</span>; }
function readStore<T>(key:string,fallback:T):T { try { if(typeof window==='undefined') return fallback; const raw=localStorage.getItem(key); return raw?JSON.parse(raw) as T:fallback; } catch { return fallback; } }
export default function Home(){
 const [selectedTopic,setSelectedTopic]=useState(lessonGroups[0].topics[0]);
 const [exerciseId,setExerciseId]=useState('q-0-0'); const [wordIndex,setWordIndex]=useState(0);
 const [answers,setAnswers]=useState<Record<string,Answer>>({}); const [checked,setChecked]=useState(false); const [hint,setHint]=useState(false);
 const [completed,setCompleted]=useState<string[]>([]); const [user,setUser]=useState<User|null>(null); const [allProgress,setAllProgress]=useState<ProgressRecord[]>([]);
 const [showLogin,setShowLogin]=useState(false); const [loginName,setLoginName]=useState(''); const [loginEmail,setLoginEmail]=useState(''); const [loginPassword,setLoginPassword]=useState(''); const [authMode,setAuthMode]=useState<'signin'|'signup'>('signin'); const [inviteCode,setInviteCode]=useState('');
 const [activeTab,setActiveTab]=useState<'Latihan'|'Materi'|'Progres'|'Panel'|'Jadi Guru'>('Latihan'); const [notice,setNotice]=useState('');
 const [celebration,setCelebration]=useState<{kind:'question'|'topic'|'finish';title:string;message:string}|null>(null);
 const [teacherForm,setTeacherForm]=useState({fullName:'',email:'',institution:'',experience:'',motivation:'',website:''}); const [teacherFormBusy,setTeacherFormBusy]=useState(false); const [teacherFormMessage,setTeacherFormMessage]=useState('');
 const [teacherApplications,setTeacherApplications]=useState<TeacherApplication[]>([]); const [applicationsBusy,setApplicationsBusy]=useState(false); const [reviewingApplication,setReviewingApplication]=useState<string|null>(null);
 useEffect(()=>{setAllProgress(readStore<ProgressRecord[]>('irab_demo_records_v051',[]));if(supabase){void (async()=>{const {data:{user:authUser}}=await supabase.auth.getUser();if(!authUser)return;const {data:profile}=await supabase.from('profiles').select('full_name, role').eq('id',authUser.id).maybeSingle();if(profile&&authUser.email){const role=profile.role==='admin'?'Admin':profile.role==='teacher'?'Guru':'Siswa';setUser({name:profile.full_name||authUser.email.split('@')[0],email:authUser.email,role});}})();}else{const savedUser=readStore<User|null>('irab_demo_user',null);setUser(savedUser?.role==='Siswa'?savedUser:null);}},[]);
 useEffect(()=>{
  if(typeof window==='undefined')return;
  let code='';
  try {
   const fragmentMatch=window.location.hash.match(/^#invite=(.+)$/);
   const url=new URL(window.location.href);
   const queryCode=url.searchParams.get('invite');
   code=fragmentMatch?decodeURIComponent(fragmentMatch[1]):(queryCode||localStorage.getItem('irab_pending_invite')||'');
   if(queryCode){url.searchParams.delete('invite');window.history.replaceState(null,'',url.pathname+url.search+window.location.hash);}
   else if(fragmentMatch){window.history.replaceState(null,'',window.location.pathname+window.location.search);}
  } catch { code=''; }
  if(code){setInviteCode(code);setShowLogin(true);setAuthMode('signin');localStorage.setItem('irab_pending_invite',code);}
 },[]);
 useEffect(()=>{
  if(activeTab!=='Panel'||user?.role!=='Admin'||!supabase)return;
  let cancelled=false;
  void (async()=>{setApplicationsBusy(true);const {data:{session}}=await supabase.auth.getSession();if(!session){if(!cancelled)setApplicationsBusy(false);return;}const response=await fetch('/api/admin/teacher-applications',{headers:{Authorization:`Bearer ${session.access_token}`},cache:'no-store'});const result=await response.json().catch(()=>({}));if(!cancelled){if(response.ok)setTeacherApplications(result.applications||[]);else setNotice(result.error||'Daftar permohonan guru tidak dapat dimuat.');setApplicationsBusy(false);}})();
  return ()=>{cancelled=true;};
 },[activeTab,user]);
 useEffect(()=>{if(user?.role==='Siswa'){setCompleted(readStore<string[]>('irab_demo_progress_v051_'+user.email,[]));}},[user]);
 const available=useMemo(()=>learningQuestions.filter(e=>e.topic===selectedTopic),[selectedTopic]);
 const exercise=available.find(e=>e.id===exerciseId)||available[0]||learningQuestions[0]; const activeIndex=Math.min(wordIndex,exercise.words.length-1); const word=exercise.words[activeIndex];
 const key=`${exercise.id}:${activeIndex}`; const answer=answers[key]||blank;
 const stage=getFoundationStage(selectedTopic); const foundationState=expectedState(word);
 const isCorrect=stage===1
  ? answer.kind===word.kind&&answer.state===foundationState
  : stage===2
   ? answer.kind===word.kind&&answer.wordClass===expectedWordClass(word)&&answer.state===foundationState
   : stage===3
    ? answer.kind===word.kind&&answer.wordClass===expectedWordClass(word)&&answer.state===foundationState&&answer.definiteness===expectedDefiniteness(word)
    : stage===4
     ? answer.kind===word.kind&&answer.wordClass===expectedWordClass(word)&&answer.state===foundationState&&answer.definiteness===expectedDefiniteness(word)&&answer.number===expectedNumber(word)
     : answer.kind===word.kind&&answer.position===word.position&&answer.state===word.state&&answer.sign===word.sign;
 const totalWords=learningQuestions.length; const studentRecords=allProgress.filter(r=>r.user.role==='Siswa');
 function chooseExercise(e:Exercise){setExerciseId(e.id);setWordIndex(0);setChecked(false);setHint(false);setActiveTab('Latihan');}
 function nextQuestion(){
  if(!checked){setNotice('Periksa jawaban terlebih dahulu sebelum lanjut.');return;}
  if(!isCorrect||!completed.includes(key)){setNotice('Jawaban kata ini belum benar. Perbaiki jawaban sebelum lanjut.');return;}
  const incompleteWord=exercise.words.findIndex((_,i)=>!completed.includes(`${exercise.id}:${i}`));
  if(incompleteWord!==-1){setWordIndex(incompleteWord);setChecked(false);setHint(false);setNotice('Lanjut bedah kata berikutnya. Semua kata dalam kalimat harus benar sebelum ke soal selanjutnya.');return;}
  const currentIndex=available.findIndex(e=>e.id===exercise.id);
  if(currentIndex<available.length-1){chooseExercise(available[currentIndex+1]);setNotice('Bagus! Semua kata pada kalimat ini sudah benar.');setCelebration({kind:'question',title:'YEEAY, KAMU BERHASIL! ✨',message:'MasyaAllah! Semua kata di kalimat ini berhasil kamu bedah. Siap lanjut ke tantangan berikutnya?'});return;}
  const score=available.filter(e=>e.words.every((_,i)=>completed.includes(`${e.id}:${i}`))).length;
  const topicList=lessonGroups.flatMap(g=>g.topics);const topicIndex=topicList.indexOf(selectedTopic);
  if(score>=4&&topicIndex<topicList.length-1){const nextTopic=topicList[topicIndex+1];setSelectedTopic(nextTopic);chooseExercise(learningQuestions.find(e=>e.topic===nextTopic)!);setNotice(`Keren! Nilaimu ${score*20}%. Materi berikutnya terbuka.`);setCelebration({kind:'topic',title:'MASYAALLAH, LEVEL UP! 🌟',message:`Kamu mendapat nilai ${score*20}% dan berhasil membuka materi “${nextTopic}”. Yuk, lanjutkan perjalanan belajarmu!`});}
  else if(topicIndex===topicList.length-1&&score>=4){setNotice('Selamat! Kamu menyelesaikan seluruh jalur belajar Bedah I‘rab.');setCelebration({kind:'finish',title:'LUAR BIASA, KAMU TAMAT! 🏆',message:'MasyaAllah! Kamu sudah menuntaskan seluruh jalur belajar. Semoga ilmu Nahwunya makin melekat!'});}
  else{const retry=available.find(e=>!e.words.every((_,i)=>completed.includes(`${e.id}:${i}`)));if(retry){chooseExercise(retry);setNotice(`Nilai materi ini ${score*20}%. Minimal 80% (4 dari 5 soal) untuk membuka materi berikutnya. Ulangi soal yang belum benar, ya.`);}}
 }

 function setField<K extends keyof Answer>(field:K,value:Answer[K]){setAnswers(prev=>({...prev,[key]:{...(prev[key]||blank),[field]:value}}));setCompleted(prev=>prev.filter(item=>item!==key));setChecked(false);}
 function check(){setChecked(true);const next=isCorrect?(completed.includes(key)?completed:[...completed,key]):completed.filter(item=>item!==key);setCompleted(next);if(user?.role==='Siswa'){localStorage.setItem('irab_demo_progress_v051_'+user.email,JSON.stringify(next));const record:ProgressRecord={user,correct:next.length,attempts:Object.keys(answers).length+1,completed:next,updatedAt:new Date().toISOString()};const records=readStore<ProgressRecord[]>('irab_demo_records_v051',[]).filter(r=>r.user.email!==user.email);records.push(record);localStorage.setItem('irab_demo_records_v051',JSON.stringify(records));setAllProgress(records);}}
 async function login(){
  if(!loginEmail.trim()){setNotice('Isi email terlebih dahulu.');return;}
  if(supabase){
   if(!loginPassword){setNotice('Masukkan kata sandi.');return;}
   if(authMode==='signup'&&!loginName.trim()){setNotice('Isi nama untuk membuat akun siswa.');return;}
   if(authMode==='signup'){
    const {data,error}=await supabase.auth.signUp({email:loginEmail.trim().toLowerCase(),password:loginPassword,options:{data:{full_name:loginName.trim()},emailRedirectTo:inviteCode.trim()?`${window.location.origin}/?invite=${encodeURIComponent(inviteCode.trim())}`:window.location.origin}});
    if(error){setNotice(error.message);return;}
    if(!data.session){setNotice('Akun dibuat. Periksa email untuk verifikasi. Jika kamu calon guru, gunakan tautan undangan yang dikirim setelah pengajuan disetujui.');setAuthMode('signin');return;}
   }else{
    const {error}=await supabase.auth.signInWithPassword({email:loginEmail.trim().toLowerCase(),password:loginPassword});
    if(error){setNotice(error.message);return;}
   }
   const {data:{user:authUser}}=await supabase.auth.getUser();
   if(!authUser?.email){setNotice('Login belum selesai. Coba masuk kembali.');return;}
   if(inviteCode.trim()){
    localStorage.setItem('irab_pending_invite',inviteCode.trim());
    const {data:{session}}=await supabase.auth.getSession();
    if(session){const response=await fetch('/api/invitations/redeem',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.access_token}`},body:JSON.stringify({code:inviteCode.trim()})});const result=await response.json().catch(()=>({}));if(!response.ok){setNotice(result.error||'Kode undangan tidak berhasil diverifikasi.');return;}}
   }
   const {data:profile}=await supabase.from('profiles').select('full_name, role').eq('id',authUser.id).maybeSingle();
   const role:Role=profile?.role==='admin'?'Admin':profile?.role==='teacher'?'Guru':'Siswa';
   const next:User={name:profile?.full_name||loginName.trim()||authUser.email.split('@')[0],email:authUser.email,role};
   localStorage.removeItem('irab_pending_invite');setInviteCode('');setUser(next);setShowLogin(false);setNotice(`Berhasil masuk sebagai ${role}. Catatan: progres latihan masih perlu dihubungkan ke tabel Supabase.`);setActiveTab(role==='Siswa'?'Latihan':'Panel');return;
  }
  if(!loginName.trim()){setNotice('Isi nama untuk mode demo siswa.');return;}
  const next:User={name:loginName.trim(),email:loginEmail.trim().toLowerCase(),role:'Siswa'};localStorage.setItem('irab_demo_user',JSON.stringify(next));setUser(next);setShowLogin(false);setNotice('Mode demo siswa aktif. Akun dan progres masih lokal; konfigurasi Supabase untuk autentikasi sungguhan.');setActiveTab('Latihan');
 }
 async function submitTeacherApplication(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setTeacherFormBusy(true);setTeacherFormMessage('');
  try{const response=await fetch('/api/teacher-applications',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(teacherForm)});const result=await response.json().catch(()=>({}));if(!response.ok){setTeacherFormMessage(result.error||'Pengajuan belum berhasil dikirim.');return;}setTeacherFormMessage(result.message||'Pengajuan terkirim.');setTeacherForm({fullName:'',email:'',institution:'',experience:'',motivation:'',website:''});}catch{setTeacherFormMessage('Tidak dapat menghubungi server. Coba lagi saat koneksi tersedia.');}finally{setTeacherFormBusy(false);}
 }
 async function decideTeacherApplication(applicationId:string,decision:'approve'|'reject'){
  if(!supabase){setNotice('Supabase belum dikonfigurasi.');return;}
  const {data:{session}}=await supabase.auth.getSession();if(!session){setNotice('Sesi login tidak ditemukan. Silakan masuk kembali.');return;}
  setReviewingApplication(applicationId);
  try{const response=await fetch('/api/admin/teacher-applications',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.access_token}`},body:JSON.stringify({applicationId,decision})});const result=await response.json().catch(()=>({}));if(!response.ok){setNotice(result.error||'Keputusan tidak berhasil disimpan.');return;}setNotice(decision==='approve'?'Permohonan disetujui dan undangan unik sudah dikirim ke email calon guru.':'Permohonan ditolak.');const refreshed=await fetch('/api/admin/teacher-applications',{headers:{Authorization:`Bearer ${session.access_token}`},cache:'no-store'});const list=await refreshed.json().catch(()=>({}));if(refreshed.ok)setTeacherApplications(list.applications||[]);}catch{setNotice('Tidak dapat menghubungi server. Coba lagi.');}finally{setReviewingApplication(null);}
 }
 async function logout(){if(supabase)await supabase.auth.signOut();localStorage.removeItem('irab_demo_user');setUser(null);setCompleted([]);setActiveTab('Latihan');setNotice('Kamu sudah keluar.');}
 return <main className="app-shell">
  <aside className="sidebar"><a className="brand" href="#top"><span className="brand-mark">بِ</span><span><strong>bedah<span className="brand-green">i‘rab</span></strong><small>LABORATORIUM NAHWU</small></span></a>
   <div className="sidebar-label">RUANG BELAJAR</div><nav className="nav-list"><button className={`nav-item ${activeTab==='Latihan'?'active':''}`} onClick={()=>setActiveTab('Latihan')}><Icon>◎</Icon> Bedah kalimat</button><button className={`nav-item ${activeTab==='Materi'?'active':''}`} onClick={()=>setActiveTab('Materi')}><Icon>▤</Icon> Materi Nahwu</button><button className={`nav-item ${activeTab==='Progres'?'active':''}`} onClick={()=>setActiveTab('Progres')}><Icon>▥</Icon> Progres belajar</button><button className={`nav-item ${activeTab==='Jadi Guru'?'active':''}`} onClick={()=>{setActiveTab('Jadi Guru');setTeacherFormMessage('');}}><Icon>✉</Icon> Jadi Guru</button>{user&&user.role!=='Siswa'&&<button className={`nav-item ${activeTab==='Panel'?'active':''}`} onClick={()=>setActiveTab('Panel')}><Icon>⚙</Icon> Panel {user.role}</button>}</nav>
   <div className="sidebar-spacer"/><div className="sidebar-note"><div className="note-icon">✦</div><strong>Belajar sampai paham.</strong><p>Setiap kata punya alasan. Temukan kaidahnya, bukan sekadar jawabannya.</p></div><div className="sidebar-footer"><span className="status-dot"/> Prototipe v0.6.3 <span>•</span> Nahwu interaktif</div>
  </aside>
  <section className="main-area" id="top"><header className="topbar"><div className="breadcrumb">Ruang belajar <span>/</span> <strong>{activeTab==='Latihan'?'Bedah kalimat':activeTab==='Materi'?'Materi Nahwu':activeTab==='Progres'?'Progres belajar':activeTab==='Jadi Guru'?'Daftar menjadi guru':'Panel '+(user?.role||'')}</strong></div><div className="topbar-right">{user?<><span className="user-chip"><span className="avatar">{user.role==='Admin'?'A':user.role==='Guru'?'G':'ط'}</span><span><b>{user.name}</b><small>{user.role}{supabase?' · akun online':' · mode demo'}</small></span></span><button className="button-secondary small" onClick={logout}>Keluar</button></>:<><span className="guest-pill">PENGUNJUNG</span><button className="button-primary small" onClick={()=>{setShowLogin(true);setNotice('');}}>Masuk / Daftar</button></>}</div></header>
  <div className="page-content">
   <section className="welcome-hero"><div className="welcome-copy"><span className="welcome-pill">✦ TEMAN BELAJAR NAHWU-MU</span><h1>Pelajari, Pahami,<br/><em>Kuasai I‘rab-nya!</em></h1><p>Bedah kalimat Arab selangkah demi selangkah. Belajar nahwu jadi lebih ringan, seru, dan bermakna.</p><div className="welcome-actions"><button className="button-primary" onClick={()=>setActiveTab('Latihan')}>Mulai belajar <span>↗</span></button><span className="welcome-note">☘ Belajar santai, sampai paham</span></div><div className="welcome-tags"><span>✦ Materi bertahap</span><span>✓ Latihan interaktif</span><span>♧ Progres belajar</span></div></div><div className="welcome-art"><span className="art-spark spark-one">✦</span><span className="art-spark spark-two">✧</span><span className="art-orbit orbit-one"></span><span className="art-orbit orbit-two"></span><img src="/mascot.svg" alt="Maskot Bedah I‘rab sedang belajar bersama kucing"/><div className="mascot-bubble">Semangat belajar! <span>♡</span></div><div className="floating-book">كِتَابُ النَّحْوِ</div></div><div className="hero-leaf leaf-one">✿</div><div className="hero-leaf leaf-two">❋</div></section>
   {notice&&<div className="notice" role="status"><span>ⓘ</span>{notice}<button onClick={()=>setNotice('')} aria-label="Tutup">×</button></div>}
   {!user&&<div className="guest-banner"><div><strong>Belajar sebagai pengunjung</strong><p>Semua latihan dan materi bisa dibuka tanpa login. Progres tidak disimpan sebagai riwayat akun.</p></div><button className="button-secondary" onClick={()=>setShowLogin(true)}>Simpan progres ↗</button></div>}
   {activeTab==='Latihan'&&<>
    <section className="stats-grid"><div className="stat-card"><div className="stat-icon green">▤</div><div><span className="stat-label">BANK LATIHAN</span><strong>{learningQuestions.length} <small>soal</small></strong></div></div><div className="stat-card"><div className="stat-icon cream">◎</div><div><span className="stat-label">TOPIK MATERI</span><strong>{lessonGroups.flatMap(g=>g.topics).length} <small>submateri</small></strong></div></div><div className="stat-card"><div className="stat-icon lavender">✦</div><div><span className="stat-label">STATUS</span><strong>{user?user.role:'Pengunjung'} <small>{user?'mode demo':'akses terbuka'}</small></strong></div></div></section>
    <div className="section-heading"><div><span className="section-kicker">MULAI DARI SINI</span><h2>Ruang bedah kalimat</h2></div><button className="text-button" onClick={()=>{setAnswers({});setCompleted([]);setChecked(false);setHint(false);if(user?.role==='Siswa')localStorage.setItem('irab_demo_progress_v051_'+user.email,'[]');}}>↻ Ulangi latihan</button></div>
    <div className="workspace-grid"><section key={exercise.id} className="sentence-card question-transition"><div className="card-topline"><div className="source-tag"><span className={`source-dot ${exercise.source==='Teks klasik'?'classic':''}`}/>{exercise.source}</div><span className="exercise-number">SOAL {String(available.findIndex(e=>e.id===exercise.id)+1).padStart(2,'0')} / 05</span></div><h3>{exercise.title}</h3><div className="topic-tag">{exercise.topic}</div>
     <div className="arabic-stage" dir="rtl" lang="ar"><div className="arabic-sentence">{exercise.sentence.split(' ').map((token,i)=>{const target=exercise.words.findIndex(w=>w.token===token);return target>=0?<button key={exercise.id+token+i} className={`word-chip ${activeIndex===target?'selected':''} ${checked&&activeIndex===target?(isCorrect?'word-correct':'word-wrong'):''}`} onClick={()=>{setWordIndex(target);setChecked(false);setHint(false);}}>{token}</button>:<span className="sentence-token" key={exercise.id+token+i}>{token}</span>;})}</div><div className="arabic-translation" dir="ltr">“{exercise.translation}”</div></div>
     <div className="sentence-context"><span className="context-icon">i</span><p>{exercise.context} {stage<=4&&<strong> Tahap {stage} dari 4: {stage===1?'jenis kata dan status i‘rab':stage===2?'jenis kata, mu‘rab/mabnī, dan status i‘rab':stage===3?'ditambah ma‘rifah/nakirah':'ditambah mufrad/tatsniyah/jamak'}.</strong>} {exercise.reference&&<strong>{exercise.reference}</strong>}</p></div><div className="word-progress"><div className="progress-label"><span>KATA DALAM KALIMAT</span><strong>{activeIndex+1} <small>/ {exercise.words.length}</small></strong></div><div className="progress-track">{exercise.words.map((w,i)=><button key={w.token+i} className={`progress-segment ${i<=activeIndex?'filled':''} ${completed.includes(`${exercise.id}:${i}`)?'done':''}`} onClick={()=>{setWordIndex(i);setChecked(false);}} aria-label={'Pilih '+w.token}/>)}</div></div><div className="word-picker-label">PILIH KATA UNTUK DIBEDAH</div><div className="word-picker" dir="rtl">{exercise.words.map((w,i)=><button key={w.token+i+'p'} onClick={()=>{setWordIndex(i);setChecked(false);setHint(false);}} className={`word-pick ${activeIndex===i?'active':''}`}>{w.token}<span>{i+1}</span></button>)}</div><div className="sentence-actions"><button className="button-secondary" onClick={()=>setHint(!hint)}>✦ {hint?'Sembunyikan petunjuk':'Beri aku petunjuk'}</button><button className="button-primary" onClick={nextQuestion} disabled={!checked}>{available.findIndex(e=>e.id===exercise.id)===4?'Nilai & lanjut materi →':'Soal berikutnya →'}</button></div>{hint&&<div className="hint-box"><strong>Petunjuk kecil</strong><p>{stage===1?'Perhatikan bentuk kata dan perannya secara umum. Apakah kata ini menunjukkan makna benda/orang, suatu tindakan, atau hanya berfungsi menghubungkan kata? Untuk statusnya, ingat bahwa tidak semua jenis kata menerima tanda i‘rab yang sama.':stage===2?'Periksa apakah akhir kata berubah karena kedudukannya dalam kalimat atau tetap pada bentuk tertentu. Cocokkan juga jenis katanya dengan kaidah Nahwu yang sudah dipelajari.':stage===3?'Selain jenis kata dan statusnya, perhatikan apakah kata tersebut sudah tertentu/teridentifikasi atau masih umum.':stage===4?'Perhatikan juga apakah kata menunjukkan satu, dua, atau lebih dari dua. Jangan menentukan bentuk jumlah hanya dari terjemahan.':'Perhatikan hubungan kata dengan unsur lain dalam kalimat untuk menentukan kedudukan Nahwu dan tanda akhirnya.'}</p></div>}</section>
    <section className="analysis-card"><div className="analysis-heading"><div className="analysis-symbol">ت</div><div><span className="section-kicker">ANALISIS KATA</span><h3>Bedah morfologi & nahwu</h3></div></div><div className="active-word-banner"><div><span>KATA YANG DIPILIH</span><strong dir="rtl" lang="ar">{word.token}</strong></div><span className="word-index-badge">Kata {activeIndex+1}</span></div><div className="form-fields"><label className="field"><span><b>01</b> Jenis kata <i>نوع الكلمة</i></span><select value={answer.kind} onChange={e=>setField('kind',e.target.value as WordKind | '')}><option value="" disabled>Pilih jenis kata...</option>{wordKinds.map(v=><option key={v}>{v}</option>)}</select></label>
     {(stage===2||stage===3||stage===4)&&<label className="field"><span><b>02</b> Jenis kata dari sisi i‘rab <i>معرب أم مبني</i></span><select value={answer.wordClass||''} onChange={e=>setField('wordClass',e.target.value as Answer['wordClass'])}><option value="" disabled>Pilih status...</option><option>Mu‘rab</option><option>Mabnī</option></select></label>}
     <label className="field"><span><b>{stage===1?'02':'03'}</b> Status i‘rab <i>الحالة الإعرابية</i></span><select value={answer.state} onChange={e=>setField('state',e.target.value as CaseState | '')}><option value="" disabled>Pilih status i‘rab...</option>{(stage<=4?(['Marfū‘','Manṣūb','Majrūr','Majzūm','Mabnī'] as CaseState[]):caseStates).map(v=><option key={v}>{v}</option>)}</select></label>
     {(stage===3||stage===4)&&<label className="field"><span><b>04</b> Ma‘rifah atau nakirah <i>المعرفة والنكرة</i></span><select value={answer.definiteness||''} onChange={e=>setField('definiteness',e.target.value as Answer['definiteness'])}><option value="" disabled>Pilih ma‘rifah/nakirah...</option><option>Ma‘rifah</option><option>Nakirah</option><option>Tidak berlaku</option></select></label>}
     {stage===4&&<label className="field"><span><b>05</b> Bentuk kata <i>مفرد أم مثنى أم جمع</i></span><select value={answer.number||''} onChange={e=>setField('number',e.target.value as Answer['number'])}><option value="" disabled>Pilih bentuk kata...</option><option>Mufrad</option><option>Tatsniyah</option><option>Jamak</option><option>Tidak berlaku</option></select></label>}
     {stage===5&&<><label className="field"><span><b>02</b> Kedudukan nahwu <i>المحل الإعرابي</i></span><select value={answer.position} onChange={e=>setField('position',e.target.value)}><option value="" disabled>Pilih kedudukan...</option>{positions.map(v=><option key={v}>{v}</option>)}</select></label><label className="field"><span><b>04</b> Tanda i‘rab <i>علامة الإعراب</i></span><select value={answer.sign} onChange={e=>setField('sign',e.target.value as Sign | '')}><option value="" disabled>Pilih tanda i‘rab...</option>{signs.map(v=><option key={v}>{v}</option>)}</select></label></>}
     </div><button className="button-check" onClick={check}>✓ Periksa jawaban <span>→</span></button>{checked&&<div className={`feedback-box ${isCorrect?'success':'error'}`} role="status"><div className="feedback-title"><span>{isCorrect?'✓':'!'}</span><strong>{isCorrect?'Tepat sekali! Jawabanmu benar.':'Belum tepat. Coba periksa lagi.'}</strong></div><p>{isCorrect?word.explanation:(stage===1?'Periksa jenis kata dan status i‘rab.':stage===2?'Periksa jenis kata, mu‘rab/mabnī, dan status i‘rab.':stage===3?'Periksa jenis kata, mu‘rab/mabnī, status i‘rab, serta ma‘rifah/nakirah.':stage===4?'Periksa jenis kata, mu‘rab/mabnī, status i‘rab, ma‘rifah/nakirah, serta mufrad/tatsniyah/jamak.':'Periksa jenis kata, kedudukan, status i‘rab, dan tandanya.')+' Kamu bisa melihat petunjuk sebelum mencoba lagi.'}</p>{isCorrect&&stage===5&&<div className="full-irab" dir="rtl" lang="ar">{word.fullIrab}</div>}<button className="feedback-link" onClick={()=>setHint(true)}>Lihat petunjuk ↗</button></div>}<div className="analysis-footnote">ⓘ Jawaban diperiksa menggunakan kunci latihan terstruktur, bukan penilaian AI.</div></section></div>
    <section className="content-panel sequential-footer"><div className="section-heading"><div><span className="section-kicker">JALUR BELAJAR</span><h2>{selectedTopic}</h2></div><span className="library-count">{available.filter(e=>e.words.every((_,i)=>completed.includes(`${e.id}:${i}`))).length}/5 soal benar</span></div><p className="panel-intro">Kerjakan soal sesuai urutan. Materi selanjutnya terbuka setelah minimal 4 dari 5 soal dijawab benar (80%). Tidak bisa melompat ke submateri lain.</p><div className="progress-track large">{available.map((e,i)=><span key={e.id} className={e.words.every((_,wordNo)=>completed.includes(`${e.id}:${wordNo}`))?'filled':''} title={`Soal ${i+1}`}/>)}</div></section>
   </>}
   {activeTab==='Materi'&&<section className="content-panel"><div className="section-heading"><div><span className="section-kicker">PETA BELAJAR</span><h2>Materi Nahwu bertahap</h2></div><span className="library-count">5 kelompok materi</span></div><p className="panel-intro">Materi disusun berurutan. Setiap submateri berisi 5 soal; nilai minimal 80% diperlukan untuk membuka submateri berikutnya. Contoh ayat Al-Qur’an tidak digunakan dalam bank latihan.</p><div className="lesson-grid">{lessonGroups.map((g,i)=><article className="lesson-card" key={g.title}><span className="lesson-number">MODUL 0{i+1}</span><h3>{g.title}</h3><p>{g.desc}</p><ul className="lesson-topic-list">{g.topics.map(t=><li key={t}><div className={`topic-practice ${t===selectedTopic?'topic-current':''}`}><span>{t}</span><span>{t===selectedTopic?'Sedang dipelajari':'5 soal'}</span></div></li>)}</ul><span className="library-count">5 soal per submateri</span></article>)}</div><div className="notice"><span>ⓘ</span> Materi ringkas dan bank soal adalah fondasi awal, bukan pengganti kitab nahwu atau bimbingan guru. Materi lanjutan perlu ditinjau ahli sebelum dipublikasikan.</div></section>}
   {activeTab==='Jadi Guru'&&<section className="content-panel"><div className="section-heading"><div><span className="section-kicker">KOLABORASI PENGAJAR</span><h2>Ajukan diri menjadi guru</h2></div><span className="library-count">Terbuka untuk semua</span></div><p className="panel-intro">Pengajar dari berbagai lembaga boleh mengajukan diri. Tim admin akan meninjau permohonan. Jika disetujui, undangan unik dikirim ke email yang didaftarkan. Pengajuan tidak otomatis memberi akses guru.</p><form className="teacher-application-form" onSubmit={submitTeacherApplication}><label className="field"><span>Nama lengkap</span><input required minLength={2} maxLength={120} value={teacherForm.fullName} onChange={e=>setTeacherForm(v=>({...v,fullName:e.target.value}))} placeholder="Nama sesuai identitas" /></label><label className="field"><span>Email aktif</span><input required type="email" maxLength={254} value={teacherForm.email} onChange={e=>setTeacherForm(v=>({...v,email:e.target.value}))} placeholder="nama@email.com" /></label><label className="field"><span>Institusi / lembaga</span><input required minLength={2} maxLength={180} value={teacherForm.institution} onChange={e=>setTeacherForm(v=>({...v,institution:e.target.value}))} placeholder="Sekolah, kampus, pesantren, atau mandiri" /></label><label className="field"><span>Pengalaman mengajar (opsional)</span><textarea maxLength={1500} value={teacherForm.experience} onChange={e=>setTeacherForm(v=>({...v,experience:e.target.value}))} placeholder="Ceritakan pengalaman mengajar Nahwu / Bahasa Arab" rows={3}/></label><label className="field"><span>Alasan ingin bergabung</span><textarea required minLength={20} maxLength={2000} value={teacherForm.motivation} onChange={e=>setTeacherForm(v=>({...v,motivation:e.target.value}))} placeholder="Apa yang ingin kamu kontribusikan untuk Bedah I‘rab?" rows={4}/></label><label className="honeypot-field" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={teacherForm.website} onChange={e=>setTeacherForm(v=>({...v,website:e.target.value}))}/></label>{teacherFormMessage&&<div className="notice" role="status"><span>ⓘ</span>{teacherFormMessage}</div>}<button className="button-check" type="submit" disabled={teacherFormBusy}>{teacherFormBusy?'Mengirim pengajuan…':'Kirim pengajuan guru →'}</button></form><div className="role-note">Privasi: data pengajuan hanya digunakan untuk proses seleksi guru. Jangan sertakan kata sandi atau informasi sensitif.</div></section>}
   {activeTab==='Progres'&&<section className="content-panel"><div className="section-heading"><div><span className="section-kicker">RIWAYAT BELAJAR</span><h2>Progres belajarmu</h2></div></div>{user?.role==='Siswa'?<><div className="progress-hero"><div><span className="section-kicker">AKUN SISWA · MODE DEMO</span><h3>{user.name}</h3><p>{user.email}</p><p>Jawaban benar tersimpan di browser ini dan terikat pada email demo.</p></div><div className="progress-big"><strong>{completed.length}</strong><span>jawaban benar</span></div></div><div className="progress-track large"><span style={{width:`${Math.min(100,completed.length/Math.max(1,totalWords)*100)}%`}}/></div><p className="panel-intro">{completed.length} jawaban benar dari {totalWords} kesempatan kata dalam bank latihan. Data demo hanya tersimpan di browser/perangkat ini; belum tersinkron ke server.</p></>:<div className="empty-state"><h3>Progres pribadi</h3><p>{user?'Panel ini khusus akun siswa.':'Kamu sedang menjadi pengunjung. Login sebagai siswa untuk mencoba penyimpanan progres demo.'}</p>{!user&&<button className="button-primary" onClick={()=>setShowLogin(true)}>Masuk sebagai siswa</button>}</div>}</section>}
   {activeTab==='Panel'&&user&&<section className="content-panel"><div className="section-heading"><div><span className="section-kicker">RUANG KERJA {user.role.toUpperCase()}</span><h2>{user.role==='Guru'?'Perkembangan siswa':'Pengelolaan website'}</h2></div><span className="demo-pill">{supabase?'TERHUBUNG / PERLU UJI':'MODE DEMO'}</span></div><div className="notice warning"><span>⚠</span> Panel ini memakai data online hanya jika Supabase dan environment server sudah dikonfigurasi. Periksa akses database sebelum digunakan untuk data siswa sungguhan.</div>{user.role==='Guru'?<><div className="stats-grid"><div className="stat-card"><div className="stat-icon green">♙</div><div><span className="stat-label">AKUN SISWA DEMO</span><strong>{studentRecords.length}</strong></div></div><div className="stat-card"><div className="stat-icon cream">✓</div><div><span className="stat-label">JAWABAN BENAR</span><strong>{studentRecords.reduce((n,r)=>n+r.correct,0)}</strong></div></div><div className="stat-card"><div className="stat-icon lavender">▤</div><div><span className="stat-label">BANK LATIHAN</span><strong>{learningQuestions.length}</strong></div></div></div><div className="table-wrap"><table><thead><tr><th>Nama siswa</th><th>Email demo</th><th>Benar</th><th>Pembaruan</th></tr></thead><tbody>{studentRecords.length?studentRecords.map(r=><tr key={r.user.email}><td>{r.user.name}</td><td>{r.user.email}</td><td>{r.correct}</td><td>{new Date(r.updatedAt).toLocaleString('id-ID')}</td></tr>):<tr><td colSpan={4}>Belum ada progres siswa demo di browser ini.</td></tr>}</tbody></table></div></>:<><div className="admin-grid"><article className="admin-card"><span className="section-kicker">KONTEN</span><h3>Bank soal dan materi</h3><p>{learningQuestions.length} slot soal dalam jalur bertahap. Bank lokal berada di <code>data/exercises.ts</code>; materi produksi perlu ditinjau sebelum diterbitkan.</p><button className="button-secondary" onClick={()=>setActiveTab('Materi')}>Lihat kurikulum ↗</button></article><article className="admin-card"><span className="section-kicker">PENGGUNA</span><h3>Permohonan guru</h3><p>Tinjau pengajuan calon guru. Jika disetujui, sistem membuat undangan unik satu kali dan mengirimkannya melalui email.</p><span className="library-count">{teacherApplications.filter(a=>a.status==='pending').length} menunggu</span></article><article className="admin-card"><span className="section-kicker">KEAMANAN</span><h3>Role dan akses</h3><p>Pendaftaran publik hanya membuat siswa. Role guru diberikan setelah persetujuan dan penukaran undangan yang terikat ke email.</p></article></div><div className="section-heading application-heading"><div><span className="section-kicker">TINJAUAN AKSES</span><h2>Permohonan guru</h2></div><button className="button-secondary small" onClick={async()=>{if(!supabase)return;const {data:{session}}=await supabase.auth.getSession();if(!session)return;setApplicationsBusy(true);const r=await fetch('/api/admin/teacher-applications',{headers:{Authorization:`Bearer ${session.access_token}`},cache:'no-store'});const d=await r.json().catch(()=>({}));if(r.ok)setTeacherApplications(d.applications||[]);else setNotice(d.error||'Gagal memuat permohonan.');setApplicationsBusy(false);}}>↻ Muat ulang</button></div>{!supabase?<div className="empty-state"><h3>Supabase belum terhubung</h3><p>Konfigurasikan environment Supabase dan buat akun admin awal sebelum meninjau permohonan.</p></div>:applicationsBusy?<div className="empty-state"><p>Memuat permohonan guru…</p></div>:<div className="table-wrap"><table><thead><tr><th>Calon guru</th><th>Email</th><th>Institusi</th><th>Tanggal</th><th>Status</th><th>Tindakan</th></tr></thead><tbody>{teacherApplications.length?teacherApplications.map(a=><tr key={a.id}><td><strong>{a.full_name}</strong><small className="application-detail">{a.motivation}</small>{a.experience&&<small className="application-detail">Pengalaman: {a.experience}</small>}</td><td>{a.email}</td><td>{a.institution}</td><td>{new Date(a.created_at).toLocaleDateString('id-ID')}</td><td><span className={`application-status ${a.status}`}>{a.status==='pending'?'Menunggu':a.status==='processing'?'Diproses':a.status==='approved'?'Disetujui':'Ditolak'}</span></td><td>{a.status==='pending'?<div className="application-actions"><button className="button-primary small" disabled={reviewingApplication===a.id} onClick={()=>decideTeacherApplication(a.id,'approve')}>{reviewingApplication===a.id?'Memproses…':'Setujui & kirim email'}</button><button className="button-secondary small" disabled={reviewingApplication===a.id} onClick={()=>decideTeacherApplication(a.id,'reject')}>Tolak</button></div>:<span className="muted">—</span>}</td></tr>):<tr><td colSpan={6}>Belum ada permohonan guru.</td></tr>}</tbody></table></div>}<p className="panel-intro application-footnote">Persetujuan memerlukan konfigurasi Resend untuk email, APP_BASE_URL, Supabase URL/anon key, dan service-role key di server. Kode mentah hanya dikirim lewat email, tidak ditampilkan di dashboard.</p></>}</section>}
   <footer className="main-footer"><span>بِسْمِ الْعِلْمِ نَبْدَأُ</span><p>Bedah I‘rab · Belajar Nahwu dengan memahami alasan.</p><span className="footer-version">BEDAH I‘RAB · V0.6.3</span></footer>
  </div></section>
  {showLogin&&<div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setShowLogin(false);}}><section className="login-modal" role="dialog" aria-modal="true" aria-labelledby="login-title"><button className="modal-close" onClick={()=>setShowLogin(false)} aria-label="Tutup">×</button><div className="modal-mark">بِ</div><div className="eyebrow">AKUN BEDAH I‘RAB</div><h2 id="login-title">Masuk ke ruang belajar</h2><p>{supabase?'Login menggunakan Supabase Auth. Pendaftaran publik selalu membuat akun siswa; guru/admin harus memiliki undangan resmi.':'Mode demo aktif karena kredensial Supabase belum dikonfigurasi. Setelah dikonfigurasi, akun publik hanya bisa mendaftar sebagai siswa.'}</p>{authMode==='signup'&&<label className="field"><span>Nama lengkap</span><input value={loginName} onChange={e=>setLoginName(e.target.value)} placeholder="Nama kamu"/></label>}<label className="field"><span>Email</span><input type="email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} placeholder="nama@email.com"/></label><label className="field"><span>Kata sandi</span><input type="password" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} placeholder="Minimal sesuai aturan Supabase"/></label>{authMode==='signin'&&<label className="field"><span>Kode undangan guru/admin (opsional)</span><input value={inviteCode} onChange={e=>setInviteCode(e.target.value)} placeholder="Kode dari admin"/></label>}<div className="role-note">{authMode==='signup'?'Akun baru otomatis menjadi siswa. Guru/admin tidak dapat memilih role sendiri.':'Undangan guru dikirim ke email setelah pengajuan disetujui. Buka tautan email, lalu daftar atau masuk menggunakan email yang sama.'}</div><button className="button-check" onClick={login}>{authMode==='signup'?'Daftar sebagai siswa →':'Masuk →'}</button><button className="feedback-link" onClick={()=>setAuthMode(authMode==='signin'?'signup':'signin')}>{authMode==='signin'?'Belum punya akun? Daftar sebagai siswa':'Sudah punya akun? Masuk'}</button><small className="modal-warning">{supabase?'Jangan bagikan kata sandi atau tautan undangan. Undangan hanya berlaku sekali dan kedaluwarsa dalam 48 jam.':'Mode demo menyimpan data di browser, bukan database online.'}</small></section></div>}
   {celebration&&<div className={`celebration-backdrop celebration-${celebration.kind}`} role="dialog" aria-modal="true" aria-labelledby="celebration-title" onClick={()=>setCelebration(null)}>
    <div className="celebration-card" onClick={e=>e.stopPropagation()}>
     <div className="celebration-confetti" aria-hidden="true"><span>✦</span><span>✿</span><span>✧</span><span>✦</span><span>❋</span><span>✧</span><span>✿</span><span>★</span><span>✦</span><span>✿</span><span>✧</span><span>❋</span><span>★</span><span>✦</span><span>✧</span></div>
     <div className="celebration-mascot"><img src="/mascot.svg" alt="" /><span>{celebration.kind==='question'?'✨':celebration.kind==='topic'?'🔓':'🏆'}</span></div>
     <p className="celebration-eyebrow">{celebration.kind==='question'?'SATU TANTANGAN TERLEWATI':celebration.kind==='topic'?'MATERI BARU TERBUKA':'PERJALANAN BELAJAR SELESAI'}</p>
     <h2 id="celebration-title">{celebration.title}</h2>
     <p className="celebration-message">{celebration.message}</p>
     <div className="celebration-stars" aria-hidden="true">✦　✧　✦</div>
     <button className="celebration-continue" onClick={()=>setCelebration(null)}>{celebration.kind==='finish'?'Keren! 🎉':'Lanjut, yuk! →'}</button>
    </div>
   </div>}
 </main>;
}
