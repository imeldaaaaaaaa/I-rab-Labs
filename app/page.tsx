"use client";

import Image from 'next/image';
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { wordKinds, caseStates, signs, type WordKind, type CaseState, type Sign } from '@/data/exercises';
import { lessonGroups,learningQuestions,positions,blank,getFoundationStage,gradeAnswer,expectedAnswer,topicUnlocked,topicScore,topics,type LearningExercise as Exercise,type Answer } from '@/data/curriculum';
import { useLearningProgress } from '@/lib/use-learning-progress';
import StaffPanel from './components/StaffPanel';
import FeedbackForm from './components/FeedbackForm';
import { supabase } from '@/lib/supabase/client';

type Role = 'Siswa' | 'Guru' | 'Admin';
type User = { id:string; name:string; role:Role; email:string };
function Icon({children}:{children:ReactNode}) { return <span className="icon" aria-hidden="true">{children}</span>; }
export default function Home(){
 const [selectedTopic,setSelectedTopic]=useState(lessonGroups[0].topics[0]);
 const [exerciseId,setExerciseId]=useState('v083-0-0'); const [wordIndex,setWordIndex]=useState(0);
 const [checked,setChecked]=useState(false); const [hint,setHint]=useState(false);
 const [user,setUser]=useState<User|null>(null);
 const {answers,setAnswers,records,completed,record,loading:progressLoading,syncStatus,pendingCount,sync}=useLearningProgress(user?.id||null,!!user&&!!supabase);
 const [reviewing,setReviewing]=useState(false);
 const [showLogin,setShowLogin]=useState(false); const [loginName,setLoginName]=useState(''); const [loginEmail,setLoginEmail]=useState(''); const [loginPassword,setLoginPassword]=useState(''); const [authMode,setAuthMode]=useState<'signin'|'signup'>('signin'); const [inviteCode,setInviteCode]=useState('');
 const [activeTab,setActiveTab]=useState<'Latihan'|'Materi'|'Progres'|'Panel'|'Jadi Guru'|'Saran'>('Latihan'); const [notice,setNotice]=useState(''); const [selectedRegion,setSelectedRegion]=useState<number|null>(null);
 const [celebration,setCelebration]=useState<{kind:'question'|'topic'|'finish';title:string;message:string}|null>(null);
 const [teacherForm,setTeacherForm]=useState({fullName:'',email:'',institution:'',experience:'',motivation:'',website:''}); const [teacherFormBusy,setTeacherFormBusy]=useState(false); const [teacherFormMessage,setTeacherFormMessage]=useState('');
 useEffect(()=>{
  if(!supabase)return;
  let active=true;
  async function loadUser(){
   const {data:{user:authUser}}=await supabase!.auth.getUser();
   if(!active)return;
   if(!authUser){setUser(null);return;}
   const {data:profile}=await supabase!.from('profiles').select('full_name,role').eq('id',authUser.id).maybeSingle();
   if(active&&profile&&authUser.email){const role:Role=profile.role==='admin'?'Admin':profile.role==='teacher'?'Guru':'Siswa';setUser({id:authUser.id,name:profile.full_name||'Pengguna',email:authUser.email,role});}
  }
  void loadUser();
  const {data:{subscription}}=supabase.auth.onAuthStateChange((event)=>{if(event==='SIGNED_OUT'){setUser(null);setActiveTab('Latihan');}else if(event==='SIGNED_IN')void Promise.resolve().then(loadUser);});
  return()=>{active=false;subscription.unsubscribe();};
 },[]);
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
 useEffect(()=>{setSelectedTopic(topics[0]);setExerciseId(learningQuestions[0].id);setWordIndex(0);setChecked(false);setReviewing(false);},[user?.id]);
 const available=useMemo(()=>learningQuestions.filter(e=>e.topic===selectedTopic),[selectedTopic]);
 const exercise=available.find(e=>e.id===exerciseId)||available[0]||learningQuestions[0]; const activeIndex=Math.min(wordIndex,exercise.words.length-1); const word=exercise.words[activeIndex];
 const key=`${exercise.id}:${activeIndex}`; const answer=answers[key]||blank; const canAccessAll=user?.role==='Guru'||user?.role==='Admin'; const activeGroup=exercise.analysisGroups?.find(g=>g.indices.length>1&&g.indices.includes(activeIndex)); const activeGroupComplete=!!activeGroup&&activeGroup.indices.every(i=>completed.includes(`${exercise.id}:${i}`));
 const stage=getFoundationStage(selectedTopic);
 const isCorrect=gradeAnswer(exercise,activeIndex,answer);
 const totalWords=learningQuestions.reduce((sum,q)=>sum+q.words.length,0);
 const earnedXp=completed.length*10;
 const playerLevel=Math.floor(earnedXp/250)+1;
 const xpInLevel=earnedXp%250;
 const xpProgress=Math.round(xpInLevel/250*100);
 const masteredTopics=topics.filter(t=>topicScore(t,completed)>=80).length;
 const currentTopic=topics.find(t=>topicScore(t,completed)<80)||null;
 const currentHouseIndex=currentTopic?lessonGroups.findIndex(g=>g.topics.includes(currentTopic)):-1;
 const mapHousePositions=[{left:'10%',top:'69%'},{left:'30%',top:'43%'},{left:'52%',top:'68%'},{left:'72%',top:'34%'},{left:'89%',top:'59%'}];
 const selectedGroup=selectedRegion===null?null:lessonGroups[selectedRegion];
 const savedRecord=records[key];const correctAnswer=expectedAnswer(exercise,activeIndex);
 function chooseExercise(e:Exercise,review=false){setSelectedTopic(e.topic);setExerciseId(e.id);setWordIndex(0);setChecked(false);setHint(false);setReviewing(review&&e.words.some((_,i)=>!!records[`${e.id}:${i}`]));setActiveTab('Latihan');}
 function enterTopicLevel(topic:string){
  const topicExercises=learningQuestions.filter(q=>q.topic===topic);
  if(!topicExercises.length)return;
  const nextExercise=topicExercises.find(q=>q.words.some((_,i)=>!completed.includes(`${q.id}:${i}`)))||topicExercises[0];
  const nextWord=nextExercise.words.findIndex((_,i)=>!completed.includes(`${nextExercise.id}:${i}`));
  setSelectedTopic(topic);setExerciseId(nextExercise.id);setWordIndex(nextWord>=0?nextWord:0);
  setChecked(false);setHint(false);setReviewing(false);setActiveTab('Latihan');
 }
 function goPrevious(){const i=learningQuestions.findIndex(e=>e.id===exercise.id);if(i>0)chooseExercise(learningQuestions[i-1]);}
 function nextQuestion(){
  if(!checked){setNotice('Periksa jawaban terlebih dahulu sebelum lanjut.');return;}
  // Penilaian per kata: jawaban salah tetap dicatat dan siswa boleh melanjutkan
  // agar nilai materi mencerminkan seluruh kata yang berhasil dianalisis.
  if(activeIndex<exercise.words.length-1){
   setWordIndex(activeIndex+1);setChecked(false);setHint(false);
   setNotice('Jawaban kata ini sudah dinilai. Lanjutkan analisis kata berikutnya.');
   return;
  }
  const currentIndex=available.findIndex(e=>e.id===exercise.id);
  if(currentIndex<available.length-1){
   chooseExercise(available[currentIndex+1]);
   setNotice('Soal berikutnya memiliki susunan kalimat dan tingkat tantangan berbeda.');
   setCelebration({kind:'question',title:'LANJUTKAN LATIHAN! ✨',message:'Perhatikan fungsi setiap kata. Jangan hanya mengandalkan posisi kata dalam kalimat.'});
   return;
  }
  const score=topicScore(selectedTopic,completed);
  const topicList=lessonGroups.flatMap(g=>g.topics);
  const topicIndex=topicList.indexOf(selectedTopic);
  if(score>=80&&topicIndex<topicList.length-1){
   const nextTopic=topicList[topicIndex+1];
   setSelectedTopic(nextTopic);
   chooseExercise(learningQuestions.find(e=>e.topic===nextTopic)!);
   setNotice(`Level selesai dengan nilai ${score}/100. Level berikutnya terbuka. Perjalanan berlanjut tanpa mengulang level yang sudah kamu tuntaskan.`);
   setCelebration({kind:'topic',title:'LEVEL BERIKUTNYA TERBUKA! 🌟',message:`Nilaimu ${score}/100. Kamu berhasil menuntaskan “${selectedTopic}”. Jalur batu menuju level berikutnya kini terbuka. Ayo lanjutkan petualanganmu!`});
  }else if(score>=80&&topicIndex===topicList.length-1){
   setNotice('Selamat! Kamu menyelesaikan seluruh jalur belajar Bedah I‘rab.');
   setCelebration({kind:'finish',title:'LUAR BIASA, KAMU TAMAT! 🏆',message:'MasyaAllah! Kamu sudah menuntaskan seluruh jalur belajar. Semoga ilmu Nahwunya makin melekat!'});
  }else{
   const first=available[0];
   chooseExercise(first);
   setNotice(`Nilai materi ${score}/100. Kamu membutuhkan minimal 80. Ulangi materi ini; setiap kata yang benar menambah nilaimu.`);
   setCelebration({kind:'topic',title:'AYO COBA LAGI! 💪',message:`Nilaimu ${score}/100. Pelajari kembali pembahasan kata yang keliru, lalu ulangi tiga soal materi ini sampai mencapai minimal 80.`});
  }
 }

 function setField<K extends keyof Answer>(field:K,value:Answer[K]){setAnswers(prev=>({...prev,[key]:{...(prev[key]||blank),[field]:value}}));setChecked(false);}
 function check(){if(progressLoading)return;setChecked(true);record(exercise.id,activeIndex,{...blank,...answer});}
 async function login(){
  if(!loginEmail.trim()){setNotice('Isi email terlebih dahulu.');return;}
  if(supabase){
   if(!loginPassword){setNotice('Masukkan kata sandi.');return;}
   if(authMode==='signup'&&!loginName.trim()){setNotice('Isi nama untuk membuat akun siswa.');return;}
   if(authMode==='signup'){
    const {data,error}=await supabase.auth.signUp({email:loginEmail.trim().toLowerCase(),password:loginPassword,options:{data:{full_name:loginName.trim()},emailRedirectTo:inviteCode.trim()?`${window.location.origin}/?invite=${encodeURIComponent(inviteCode.trim())}`:window.location.origin}});
    if(error){setNotice(error.message);return;}
    if(!data.session){setNotice('Akun dibuat. Periksa email untuk verifikasi, lalu masuk. Untuk menjadi guru, isi formulir Jadi Guru setelah login.');setAuthMode('signin');return;}
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
   const next:User={id:authUser.id,name:profile?.full_name||loginName.trim()||authUser.email.split('@')[0],email:authUser.email,role};
   localStorage.removeItem('irab_pending_invite');setInviteCode('');setUser(next);setShowLogin(false);setNotice(`Berhasil masuk sebagai ${role}.`);setActiveTab(role==='Siswa'?'Latihan':'Panel');return;
  }
  setNotice('Login belum tersedia. Konfigurasi Supabase diperlukan.');
 }
 async function submitTeacherApplication(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(!user||!supabase){setTeacherFormMessage('Masuk dan verifikasi email akun terlebih dahulu.');setShowLogin(true);return;}
  setTeacherFormBusy(true);setTeacherFormMessage('');
  try{
   const {data:{session}}=await supabase.auth.getSession();if(!session)throw Error('Silakan masuk kembali.');
   const response=await fetch('/api/teacher-applications',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.access_token}`},body:JSON.stringify(teacherForm)});
   const result=await response.json();if(!response.ok)throw Error(result.error||'Pendaftaran gagal.');
   setUser({...user,name:teacherForm.fullName,role:'Guru'});setTeacherFormMessage(result.message);setNotice(result.message);setActiveTab('Panel');
  }catch(e){setTeacherFormMessage((e as Error).message);}finally{setTeacherFormBusy(false);}
 }
 async function logout(){if(supabase)await supabase.auth.signOut();setUser(null);setChecked(false);setReviewing(false);setSelectedTopic(topics[0]);setExerciseId(learningQuestions[0].id);setWordIndex(0);setActiveTab('Latihan');setNotice('Kamu sudah keluar.');}
 return <main className="app-shell">
  <aside className="sidebar"><a className="brand" href="#top"><span className="brand-owl"><Image width={54} height={54} src="/owl-mascot.svg" alt="Maskot burung hantu I'rab Labs"/></span><span><strong>I‘rab<span className="brand-green"> Labs</span></strong><small>PETUALANGAN NAHWU</small></span></a>
   <div className="sidebar-label">RUANG PETUALANGAN</div><nav className="nav-list"><button className={`nav-item ${activeTab==='Latihan'?'active':''}`} onClick={()=>setActiveTab('Latihan')}><Icon>◎</Icon> Bedah kalimat</button><button className={`nav-item ${activeTab==='Materi'?'active':''}`} onClick={()=>{setSelectedRegion(null);setActiveTab('Materi');}}><Icon>▤</Icon> Materi Nahwu</button><button className={`nav-item ${activeTab==='Progres'?'active':''}`} onClick={()=>setActiveTab('Progres')}><Icon>▥</Icon> Progres belajar</button><button className={`nav-item ${activeTab==='Jadi Guru'?'active':''}`} onClick={()=>{setActiveTab('Jadi Guru');setTeacherFormMessage('');}}><Icon>✉</Icon> Jadi Guru</button>{user&&user.role!=='Siswa'&&<button className={`nav-item ${activeTab==='Panel'?'active':''}`} onClick={()=>setActiveTab('Panel')}><Icon>⚙</Icon> Panel {user.role}</button>}<button className={`nav-item ${activeTab==='Saran'?'active':''}`} onClick={()=>setActiveTab('Saran')}><Icon>✎</Icon> Kotak saran</button></nav>
   <div className="sidebar-spacer"/><div className="sidebar-note"><div className="note-icon">🦉</div><strong>Teman perjalananmu.</strong><p>Ikuti petunjuk, pahami susunan kalimat, dan taklukkan setiap tantangan Nahwu.</p></div><div className="sidebar-footer"><span className="status-dot"/> I‘rab Labs <span>•</span> Nahwu interaktif</div>
  </aside>
  <section className="main-area" id="top"><header className="topbar"><div className="breadcrumb">Ruang belajar <span>/</span> <strong>{activeTab==='Latihan'?'Bedah kalimat':activeTab==='Materi'?(selectedRegion===null?'Dunia Nahwu':lessonGroups[selectedRegion]?.title||'Wilayah'):activeTab==='Progres'?'Progres belajar':activeTab==='Jadi Guru'?'Daftar menjadi guru':activeTab==='Saran'?'Kotak saran':'Panel '+(user?.role||'')}</strong></div><div className="topbar-right"><span className="level-pill adventure-level-pill"><span>★</span> LEVEL {playerLevel} · {earnedXp} XP</span>{user?<><span className="user-chip"><span className="avatar">{user.role==='Admin'?'A':user.role==='Guru'?'G':'ط'}</span><span><b>{user.name}</b><small>{user.role} · akun online</small></span></span><button className="button-secondary small" onClick={logout}>Keluar</button></>:<><span className="guest-pill">PENGUNJUNG</span><button className="button-primary small" onClick={()=>{setShowLogin(true);setNotice('');}}>Masuk / Daftar</button></>}</div></header>
  <div className="page-content">
   <section className="welcome-hero adventure-hero">
    <div className="welcome-copy adventure-copy">
     <span className="welcome-pill">🗺️ PETUALANGAN BELAJAR NAHWU</span>
     <h1>Jelajahi dunia<br/><em>Nahwu dan I‘rab</em></h1>
     <p>Ikuti perjalanan dari satu materi ke materi berikutnya. Selesaikan tantangan, pahami fungsi setiap kata, dan bangun penguasaan Nahwu selangkah demi selangkah.</p>
     <div className="welcome-actions"><button className="button-primary" onClick={()=>setActiveTab('Latihan')}>Lanjutkan tantangan <span>↗</span></button><button className="button-secondary adventure-map-button" onClick={()=>{setSelectedRegion(null);setActiveTab('Materi');}}>Lihat peta materi</button></div>
     <div className="welcome-tags"><span>✦ 23 submateri</span><span>✓ 69 tantangan</span><span>🦉 Didampingi maskot</span></div>
    </div>
    <div className="welcome-art adventure-art"><div className="owl-glow"></div><span className="art-spark spark-one">✦</span><span className="art-spark spark-two">✧</span><Image width={560} height={560} src="/owl-mascot.svg" alt="Burung hantu pendamping petualangan I'rab Labs"/><div className="mascot-bubble">Ayo, kita belajar! <span>✦</span></div><div className="floating-book">كِتَابُ النَّحْوِ</div><span className="owl-floating-star star-a">✧</span><span className="owl-floating-star star-b">★</span></div>
   </section>
   <section className="adventure-progress-card">
    <div className="adventure-level-emblem"><span>LEVEL</span><strong>{String(playerLevel).padStart(2,'0')}</strong></div>
    <div className="adventure-progress-main"><div className="adventure-progress-heading"><div><span className="section-kicker">PERJALANANMU</span><h2>Penjelajah Nahwu</h2></div><strong>{earnedXp} XP</strong></div><div className="adventure-progress-track"><span style={{width:`${xpProgress}%`}}/></div><div className="adventure-progress-foot"><span>{xpInLevel} / 250 XP menuju level berikutnya</span><span>{masteredTopics} dari {topics.length} submateri dikuasai</span></div></div>
    <div className="adventure-trophy"><span>🏆</span><strong>{masteredTopics}</strong><small>Materi tuntas</small></div>
   </section>
   {user?.role==='Siswa'&&<p className="role-note">Nama dan progres belajarmu dapat dilihat oleh guru dan admin Irab Labs.</p>}
   {notice&&<div className="notice" role="status"><span>ⓘ</span>{notice}<button onClick={()=>setNotice('')} aria-label="Tutup">×</button></div>}
   {!user&&<div className="guest-banner"><div><strong>Belajar sebagai pengunjung</strong><p>Latihan terbuka tanpa login. Jawaban dan review tersimpan di browser ini. Login agar progres baru tersimpan ke akun.</p></div><button className="button-secondary" onClick={()=>setShowLogin(true)}>Masuk / daftar ↗</button></div>}
   {activeTab==='Latihan'&&<>
    <section className="stats-grid"><div className="stat-card"><div className="stat-icon green">▤</div><div><span className="stat-label">BANK LATIHAN</span><strong>{learningQuestions.length} <small>soal</small></strong></div></div><div className="stat-card"><div className="stat-icon cream">◎</div><div><span className="stat-label">TOPIK MATERI</span><strong>{lessonGroups.flatMap(g=>g.topics).length} <small>submateri</small></strong></div></div><div className="stat-card"><div className="stat-icon lavender">✦</div><div><span className="stat-label">STATUS</span><strong>{user?user.role:'Pengunjung'} <small>{user?'akun online':'akses terbuka'}</small></strong></div></div></section>
    <div className="section-heading"><div><span className="section-kicker">MULAI DARI SINI</span><h2>Ruang bedah kalimat</h2></div><button className="text-button" onClick={()=>{setReviewing(false);setChecked(false);setHint(false);}}>↻ Latihan ulang soal ini</button></div>
    <div className="learning-status"><span role="status">{progressLoading?'Memuat riwayat…':user?(syncStatus||'Menyiapkan progres online'):'Riwayat tersimpan di browser ini'}{pendingCount>0&&` · ${pendingCount} jawaban menunggu sinkron`}</span>{user&&<button className="button-secondary small" disabled={progressLoading} onClick={()=>void sync()}>Sinkronkan</button>}</div>
    <div className="review-nav"><button className="button-secondary" disabled={exercise.id===learningQuestions[0].id||progressLoading} onClick={goPrevious}>← Soal sebelumnya</button><div className="question-numbers">{available.map((q,i)=>{const seen=q.words.some((_,j)=>!!records[`${q.id}:${j}`]);const prior=available.slice(0,i).every(p=>p.words.every((_,j)=>completed.includes(`${p.id}:${j}`)));return <button key={q.id} className={`button-secondary small ${q.id===exercise.id?'question-current':''}`} aria-current={q.id===exercise.id?'step':undefined} disabled={progressLoading||(!canAccessAll&&!seen&&!prior)} onClick={()=>chooseExercise(q)}>{i+1}{q.words.every((_,j)=>completed.includes(`${q.id}:${j}`))?' ✓':''}</button>;})}</div><span>{reviewing?'Mode review':'Mode latihan'}</span></div>
    <div className="workspace-grid"><section key={exercise.id} className="sentence-card question-transition"><div className="card-topline"><div className="source-tag"><span className={`source-dot ${exercise.source==='Teks klasik'?'classic':''}`}/>{exercise.source}</div><span className="exercise-number">SOAL {String(available.findIndex(e=>e.id===exercise.id)+1).padStart(2,'0')} / 03</span></div><h3>{exercise.title}</h3><div className="topic-tag">{exercise.topic}</div>
     <div className="arabic-stage" dir="rtl" lang="ar"><div className="arabic-sentence">{exercise.words.map((w,i)=><button key={`${exercise.id}:${i}`} className={`word-chip ${activeIndex===i?'selected':''} ${completed.includes(`${exercise.id}:${i}`)?'word-correct':''}`} onClick={()=>{setWordIndex(i);setChecked(false);setHint(false);}}>{w.token}</button>)}</div><div className="arabic-translation" dir="ltr">“{exercise.translation}”</div></div>
     <div className="sentence-context"><span className="context-icon">i</span><p>{exercise.context} {stage<=4&&<strong> Tahap {stage} dari 4: {stage===1?'jenis kata dan status i‘rab':stage===2?'jenis kata, mu‘rab/mabnī, dan status i‘rab':stage===3?'ditambah ma‘rifah/nakirah':'ditambah mufrad/tatsniyah/jamak'}.</strong>} {exercise.reference&&<strong>{exercise.reference}</strong>}</p></div><div className="word-progress"><div className="progress-label"><span>KATA DALAM KALIMAT</span><strong>{activeIndex+1} <small>/ {exercise.words.length}</small></strong></div><div className="progress-track">{exercise.words.map((w,i)=><button key={w.token+i} className={`progress-segment ${i<=activeIndex?'filled':''} ${completed.includes(`${exercise.id}:${i}`)?'done':''}`} onClick={()=>{setWordIndex(i);setChecked(false);}} aria-label={'Pilih '+w.token}/>)}</div></div>{exercise.analysisGroups?.filter(g=>g.indices.length>1).length?<div className="phrase-group-picker"><div className="word-picker-label">KELOMPOK FRASA DALAM KALIMAT</div>{exercise.analysisGroups?.filter(g=>g.indices.length>1).map((g,gi)=><button key={gi} className={`phrase-group-button ${activeGroup===g?'active':''}`} onClick={()=>{setWordIndex(g.indices[0]);setChecked(false);setHint(false);}}><strong dir="rtl" lang="ar">{g.indices.map(i=>exercise.words[i].token).join(' ')}</strong><span>{g.label}</span></button>)}</div>:null}<div className="word-picker-label">PILIH UNSUR UNTUK MELIHAT RINCIAN I‘RAB</div><div className="word-picker" dir="rtl">{exercise.words.map((w,i)=><button key={w.token+i+'p'} onClick={()=>{setWordIndex(i);setChecked(false);setHint(false);}} className={`word-pick ${activeIndex===i?'active':''}`}>{w.token}<span>{i+1}</span></button>)}</div><div className="sentence-actions"><button className="button-secondary" onClick={()=>setHint(!hint)}>✦ {hint?'Sembunyikan petunjuk':'Beri aku petunjuk'}</button><button className="button-primary" onClick={nextQuestion} disabled={progressLoading||(!checked&&!(reviewing&&exercise.words.every((_,i)=>completed.includes(`${exercise.id}:${i}`))))}>{activeIndex<exercise.words.length-1?'Kata berikutnya →':available.findIndex(e=>e.id===exercise.id)===available.length-1?'Nilai & lanjut materi →':'Soal berikutnya →'}</button></div>{hint&&<div className="hint-box"><strong>Petunjuk khusus untuk {word.token}</strong><p>{activeGroup?activeGroup.hint+' '+(word.hint||''):word.hint||'Perhatikan hubungan kata ini dengan unsur lain dalam kalimat, lalu tentukan fungsi dan tanda i‘rabnya.'}</p></div>}</section>
    <section className="analysis-card"><div className="analysis-heading"><div className="analysis-symbol">ت</div><div><span className="section-kicker">ANALISIS KATA & FRASA</span><h3>Bedah morfologi & nahwu</h3></div></div>{activeGroup&&<div className="phrase-analysis-group"><div className="phrase-analysis-kicker">SATU KESATUAN FUNGSI NAHWU</div><strong className="phrase-analysis-arabic" dir="rtl" lang="ar">{activeGroup.indices.map(i=>exercise.words[i].token).join(' ')}</strong><b>{activeGroup.label}</b><p>Analisis frasa ini sebagai satu kesatuan fungsi dalam kalimat. Unsur di bawah membantu memeriksa i‘rab internalnya.</p><div className="phrase-analysis-parts"><span>Unsur di dalam frasa:</span>{activeGroup.indices.map(i=><button key={i} className={i===activeIndex?'active':''} onClick={()=>{setWordIndex(i);setChecked(false);setHint(false);}} dir="rtl">{exercise.words[i].token}</button>)}</div>{activeGroupComplete&&<div className="phrase-analysis-reveal"><strong>{activeGroup.functionLabel}</strong><p>{activeGroup.explanation}</p></div>}</div>}<div className="active-word-banner"><div><span>KATA YANG DIPILIH</span><strong dir="rtl" lang="ar">{word.token}</strong></div><span className="word-index-badge">Kata {activeIndex+1}</span></div><div className="form-fields" style={{display:reviewing?'none':undefined}}><label className="field"><span><b>01</b> Jenis kata <i>نوع الكلمة</i></span><select value={answer.kind} onChange={e=>setField('kind',e.target.value as WordKind | '')}><option value="" disabled>Pilih jenis kata...</option>{wordKinds.map(v=><option key={v}>{v}</option>)}</select></label>
     {(stage===2||stage===3||stage===4)&&<label className="field"><span><b>02</b> Jenis kata dari sisi i‘rab <i>معرب أم مبني</i></span><select value={answer.wordClass||''} onChange={e=>setField('wordClass',e.target.value as Answer['wordClass'])}><option value="" disabled>Pilih status...</option><option>Mu‘rab</option><option>Mabnī</option></select></label>}
     <label className="field"><span><b>{stage===1?'02':'03'}</b> Status i‘rab <i>الحالة الإعرابية</i></span><select value={answer.state} onChange={e=>setField('state',e.target.value as CaseState | '')}><option value="" disabled>Pilih status i‘rab...</option>{(stage<=4?(['Marfū‘','Manṣūb','Majrūr','Majzūm','Mabnī'] as CaseState[]):caseStates).map(v=><option key={v}>{v}</option>)}</select></label>
     {(stage===3||stage===4)&&<label className="field"><span><b>04</b> Ma‘rifah atau nakirah <i>المعرفة والنكرة</i></span><select value={answer.definiteness||''} onChange={e=>setField('definiteness',e.target.value as Answer['definiteness'])}><option value="" disabled>Pilih ma‘rifah/nakirah...</option><option>Ma‘rifah</option><option>Nakirah</option><option>Tidak berlaku</option></select></label>}
     {stage===4&&<label className="field"><span><b>05</b> Bentuk kata <i>مفرد أم مثنى أم جمع</i></span><select value={answer.number||''} onChange={e=>setField('number',e.target.value as Answer['number'])}><option value="" disabled>Pilih bentuk kata...</option><option>Mufrad</option><option>Tatsniyah</option><option>Jamak</option><option>Tidak berlaku</option></select></label>}
     {stage===5&&<><label className="field"><span><b>02</b> Kedudukan nahwu <i>المحل الإعرابي</i></span><select value={answer.position} onChange={e=>setField('position',e.target.value)}><option value="" disabled>Pilih kedudukan...</option>{positions.map(v=><option key={v}>{v}</option>)}</select></label><label className="field"><span><b>04</b> Tanda i‘rab <i>علامة الإعراب</i></span><select value={answer.sign} onChange={e=>setField('sign',e.target.value as Sign | '')}><option value="" disabled>Pilih tanda i‘rab...</option>{signs.map(v=><option key={v}>{v}</option>)}</select></label></>}
     </div><button className="button-check" disabled={progressLoading} style={{display:reviewing?'none':undefined}} onClick={check}>✓ Periksa jawaban <span>→</span></button>{!reviewing&&checked&&<div className={`feedback-box ${isCorrect?'success':'error'}`} role="status"><div className="feedback-title"><span>{isCorrect?'✓':'!'}</span><strong>{isCorrect?'Tepat sekali! Jawabanmu benar.':'Belum tepat. Coba periksa lagi.'}</strong></div><p>{isCorrect?'Tepat. '+word.explanation:'Jawaban yang tepat: '+word.position+'. '+word.state+' dengan tanda '+word.sign+'. '+word.explanation}</p>{(!isCorrect||stage===5)&&<div className="full-irab" dir="rtl" lang="ar">{word.fullIrab}</div>}<button className="feedback-link" onClick={()=>setHint(true)}>Lihat petunjuk ↗</button></div>}{reviewing&&<div className="review-answer"><h3>Review kata ini</h3>{savedRecord?<><p>{savedRecord.completed?'Sudah berhasil dijawab ✓':'Jawaban sebelumnya belum tepat'}</p><div className="table-wrap"><table><thead><tr><th>Analisis</th><th>Jawaban tersimpan</th><th>Jawaban benar</th></tr></thead><tbody>{([['Jenis kata','kind'],['Status i‘rab','state'],...(stage>=2&&stage<=4?[['Mu‘rab / mabnī','wordClass']]:[]),...(stage>=3&&stage<=4?[['Ma‘rifah / nakirah','definiteness']]:[]),...(stage===4?[['Bentuk kata','number']]:[]),...(stage===5?[['Kedudukan','position'],['Tanda i‘rab','sign']]:[])] as [string,keyof Answer][]).map(([label,field])=><tr key={field}><td>{label}</td><td>{savedRecord.answer[field]||'—'}</td><td>{correctAnswer[field]}</td></tr>)}</tbody></table></div><p>{word.explanation}</p><div className="full-irab" dir="rtl" lang="ar">{word.fullIrab}</div></>:<p>Kata ini belum pernah dijawab. Pilih latihan ulang untuk mengerjakannya.</p>}<button className="button-secondary" onClick={()=>{setReviewing(false);setChecked(false);}}>Latihan ulang</button><p className="role-note">Review tidak mengubah nilai atau jumlah percobaan. Jawaban yang sudah benar dipertahankan sebagai hasil terbaik.</p></div>}<div className="analysis-footnote">ⓘ Jawaban diperiksa menggunakan kunci latihan terstruktur, bukan penilaian AI.</div></section></div>
    <section className="content-panel sequential-footer"><div className="section-heading"><div><span className="section-kicker">JALUR BELAJAR</span><h2>{selectedTopic}</h2></div><span className="library-count">{available.filter(e=>e.words.every((_,i)=>completed.includes(`${e.id}:${i}`))).length}/3 soal benar</span></div><p className="panel-intro">Kerjakan soal sesuai urutan. Materi selanjutnya terbuka setelah ketepatan minimal 80% dari seluruh unsur kata pada tiga soal. Jika belum mencapai 80%, ulangi materi tersebut.</p><div className="progress-track large">{available.map((e,i)=><span key={e.id} className={e.words.every((_,wordNo)=>completed.includes(`${e.id}:${wordNo}`))?'filled':''} title={`Soal ${i+1}`}/>)}</div></section>
   </>}
   {activeTab==='Materi'&&<section className="adventure-world-page">
    {selectedRegion===null ? <>
     <div className="world-page-heading"><div><span className="section-kicker">PETA PETUALANGAN</span><h2>Dunia Nahwu</h2><p>Jelajahi dunia, kunjungi wilayah, lalu selesaikan setiap level di dalamnya.</p></div><div className="world-progress-chip"><span>🏆</span><strong>{masteredTopics}/{topics.length}</strong><small>level tuntas</small></div></div>
     <div className="world-map-legend"><span><i className="legend-current"/>Sedang dijelajahi</span><span><i className="legend-open"/>Terbuka</span><span><i className="legend-done"/>Selesai</span><span><i className="legend-locked"/>Belum terbuka</span></div>
     <div className="world-map-shell">
      <div className="world-map-topline"><span>🧭 PETA WILAYAH</span><span>5 RUMAH MATERI · {topics.length} LEVEL</span></div>
      <div className="world-map-canvas">
       <svg className="world-map-route" viewBox="0 0 1100 650" preserveAspectRatio="none" aria-hidden="true">
        <defs>
         <linearGradient id="world-ground" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#e6edcf"/><stop offset=".52" stopColor="#dce8c6"/><stop offset="1" stopColor="#d2e0bd"/></linearGradient>
         <linearGradient id="world-river" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#a9d3ce"/><stop offset="1" stopColor="#6ea9a0"/></linearGradient>
         <filter id="stone-shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#5e684b" floodOpacity=".25"/></filter>
         <pattern id="grass-speckles" width="38" height="38" patternUnits="userSpaceOnUse"><circle cx="7" cy="9" r="1.5" fill="#819c68" opacity=".23"/><circle cx="28" cy="27" r="1.2" fill="#819c68" opacity=".2"/></pattern>
        </defs>
        <rect width="1100" height="650" fill="url(#world-ground)"/>
        <rect width="1100" height="650" fill="url(#grass-speckles)"/>
        <path d="M0 0H310Q260 95 335 155T280 310Q185 350 0 300Z" fill="#c8d9b2" opacity=".62"/>
        <path d="M760 0H1100V250Q1000 220 930 270T760 205Z" fill="#c2d5ae" opacity=".65"/>
        <path d="M0 490Q155 420 260 510T500 555Q640 575 720 650H0Z" fill="#c4d7b0" opacity=".7"/>
        <path d="M690 650Q730 520 865 500T1100 430V650Z" fill="#bfd2a9" opacity=".65"/>
        <path d="M0 180Q120 130 230 185T390 190" fill="none" stroke="#d7e2c3" strokeWidth="3" opacity=".8"/>
        <path d="M780 65Q890 30 1020 75" fill="none" stroke="#d7e2c3" strokeWidth="3" opacity=".8"/>
        <path d="M520 0Q490 120 580 180T650 340Q675 430 610 520T650 650" fill="none" stroke="url(#world-river)" strokeWidth="34" strokeLinecap="round" opacity=".8"/>
        <path d="M520 0Q490 120 580 180T650 340Q675 430 610 520T650 650" fill="none" stroke="#d5eee2" strokeWidth="4" strokeDasharray="10 18" opacity=".8"/>
        <path d="M105 450C165 440 180 290 325 285S440 430 575 430S675 220 790 205S900 350 1000 365" fill="none" stroke="#927f5b" strokeWidth="48" strokeLinecap="round" strokeLinejoin="round" opacity=".65" filter="url(#stone-shadow)"/>
        <path d="M105 450C165 440 180 290 325 285S440 430 575 430S675 220 790 205S900 350 1000 365" fill="none" stroke="#d7c69d" strokeWidth="39" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M105 450C165 440 180 290 325 285S440 430 575 430S675 220 790 205S900 350 1000 365" fill="none" stroke="#a9946d" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 24" opacity=".72"/>
        <path d="M540 0Q520 85 548 135" stroke="#a9946d" strokeWidth="18" fill="none" strokeLinecap="round"/>
        <path d="M540 0Q520 85 548 135" stroke="#d9c99e" strokeWidth="12" fill="none" strokeDasharray="2 15" strokeLinecap="round"/>
        <g fill="#9b9b83" stroke="#7d806b" strokeWidth="3" filter="url(#stone-shadow)">
         <path d="m205 100 22-24 35 4 17 24-13 23-43 2-23-13z"/><path d="m850 440 23-30 34 3 18 26-12 23-43 4-25-12z"/>
         <path d="m440 105 15-17 25 3 11 18-12 16-28 1-13-10z"/><path d="m100 560 18-22 31 3 13 19-13 19-32 1-18-10z"/>
        </g>
        <g fill="#78986c" opacity=".9">
         <path d="M58 90 80 35 102 90Z"/><path d="M83 96 105 43 127 96Z"/><path d="M980 90 1002 35 1024 90Z"/>
         <path d="M1010 101 1032 47 1054 101Z"/><path d="M735 550 757 495 779 550Z"/><path d="M765 562 787 507 809 562Z"/>
         <path d="M360 550 382 495 404 550Z"/><path d="M388 560 410 505 432 560Z"/>
        </g>
        <g fill="#567e55"><rect x="75" y="85" width="10" height="31" rx="4"/><rect x="1000" y="85" width="10" height="31" rx="4"/><rect x="755" y="545" width="10" height="31" rx="4"/><rect x="380" y="545" width="10" height="31" rx="4"/></g>
        <g fill="#e5c875" opacity=".9"><circle cx="150" cy="185" r="5"/><circle cx="165" cy="195" r="3"/><circle cx="930" cy="120" r="5"/><circle cx="945" cy="132" r="3"/><circle cx="690" cy="525" r="5"/></g>
        <g fill="#a9c9be" stroke="#78a99d" strokeWidth="3"><ellipse cx="930" cy="525" rx="68" ry="27"/><ellipse cx="930" cy="525" rx="43" ry="15" fill="#c4ded1"/></g>
        <g fill="#b0a58c" stroke="#877f6d" strokeWidth="2"><ellipse cx="885" cy="536" rx="17" ry="9"/><ellipse cx="966" cy="511" rx="15" ry="8"/><ellipse cx="1000" cy="539" rx="12" ry="7"/></g>
       </svg>
       <div className="map-deco map-deco-mountain">⛰️</div><div className="map-deco map-deco-crystal">💎</div><div className="map-deco map-deco-camp">⛺</div><div className="map-deco map-deco-owl">🦉</div>
       <div className="map-rock map-rock-one"></div><div className="map-rock map-rock-two"></div><div className="map-rock map-rock-three"></div><div className="map-rock map-rock-four"></div>
       <div className="map-tree map-tree-one">🌲</div><div className="map-tree map-tree-two">🌳</div><div className="map-tree map-tree-three">🌲</div><div className="map-tree map-tree-four">🌳</div>
       {lessonGroups.map((g,i)=>{
        const mastered=g.topics.filter(t=>topicScore(t,completed)>=80).length;
        const houseComplete=mastered===g.topics.length;
        const houseUnlocked=canAccessAll||topicUnlocked(g.topics[0],completed);
        const isCurrent=currentHouseIndex===i&&!houseComplete;
        const status=houseComplete?'TUNTAS':!houseUnlocked?'TERKUNCI':isCurrent?'LANJUTKAN':'TERBUKA';
        return <button key={g.title} className={`world-house-node region-${i+1} ${houseComplete?'house-complete':''} ${!houseUnlocked?'house-locked':''} ${isCurrent?'house-current':''}`} style={mapHousePositions[i]} onClick={()=>setSelectedRegion(i)} aria-label={`Buka ${g.title}, ${mastered} dari ${g.topics.length} level selesai`}>
         <span className="house-node-status">{houseComplete?'✓':!houseUnlocked?'🔒':isCurrent?'★':'✦'} {status}</span>
         <span className={`region-landmark-icon landmark-${i+1}`} aria-hidden="true">{['📜','🏛️','⛰️','🌳','🔭'][i]||'✨'}</span>
         <strong>Wilayah {i+1}</strong><small>{g.title}</small><span className="house-node-progress">{mastered}/{g.topics.length} level</span>
        </button>;
       })}
      </div>
      <div className="world-map-footer"><span>🪨 Ikuti jalur batu untuk berpindah wilayah.</span><span>Pilih wilayah untuk melihat level di dalamnya.</span></div>
     </div>
     <div className="world-guide-card"><Image width={86} height={86} src="/owl-mascot.svg" alt="Burung hantu pemandu"/><div><strong>Petunjuk dari teman perjalananmu</strong><p>Setiap wilayah mewakili satu bab. Di dalamnya terdapat beberapa level sesuai subbab. Selesaikan level yang terbuka untuk membuka jalur selanjutnya. Level yang sudah tuntas tidak perlu diulang.</p></div></div>
    </> : selectedGroup && <div className="house-detail-page">
     <button className="back-world-button" onClick={()=>setSelectedRegion(null)}>← Kembali ke Dunia Nahwu</button>
     <div className={`house-detail-hero region-${selectedRegion+1}`}>
      <div className="house-detail-visual"><div className={`region-landmark-icon region-landmark-large landmark-${selectedRegion+1}`} aria-hidden="true">{['📜','🏛️','⛰️','🌳','🔭'][selectedRegion]||'✨'}</div><div className="house-owl-guide"><Image width={112} height={112} src="/owl-mascot.svg" alt="Burung hantu pemandu"/></div></div>
      <div className="house-detail-copy"><span className="section-kicker">RUMAH MATERI {String(selectedRegion+1).padStart(2,'0')} · BAB {selectedRegion+1}</span><h2>{selectedGroup.title}</h2><p>{selectedGroup.desc}</p><div className="house-detail-progress"><div><strong>{selectedGroup.topics.filter(t=>topicScore(t,completed)>=80).length}/{selectedGroup.topics.length}</strong><small>level selesai</small></div><div className="region-progress"><span style={{width:`${Math.round(selectedGroup.topics.filter(t=>topicScore(t,completed)>=80).length/selectedGroup.topics.length*100)}%`}}/></div></div></div>
     </div>
     <div className="level-path-heading"><div><span className="section-kicker">JALUR PETUALANGAN</span><h2>Pilih level untuk mulai belajar</h2><p>Setiap level adalah satu subbab. Progres akan dilanjutkan dari kata yang belum selesai.</p></div><span className="library-count">{selectedGroup.topics.length} level</span></div>
     <div className="level-path-list">
      {selectedGroup.topics.map((t,ti)=>{
       const score=topicScore(t,completed);
       const done=score>=80;
       const unlocked=canAccessAll||topicUnlocked(t,completed);
       const isCurrent=t===currentTopic;
       const topicExercises=learningQuestions.filter(q=>q.topic===t);
       const doneQuestions=topicExercises.filter(q=>q.words.every((_,wi)=>completed.includes(`${q.id}:${wi}`))).length;
       return <div className={`level-path-item ${done?'level-done':''} ${!unlocked?'level-locked':''} ${isCurrent?'level-current':''}`} key={t}>
        <div className="level-stone">{done?'✓':unlocked?String(ti+1).padStart(2,'0'):'🔒'}</div>
        <button className="level-card" disabled={progressLoading||!unlocked} onClick={()=>enterTopicLevel(t)}>
         <span className="level-card-top"><span>LEVEL {String(ti+1).padStart(2,'0')}</span><span className={`level-status ${done?'done':unlocked?'open':'locked'}`}>{done?'✓ SELESAI':unlocked?(isCurrent?'★ LANJUTKAN':'TERBUKA'):'🔒 TERKUNCI'}</span></span>
         <strong>{t}</strong>
         <span className="level-card-bottom"><span>{done?'Nilai terbaik '+score+'/100':unlocked?'3 latihan · '+doneQuestions+'/3 selesai':'Selesaikan level sebelumnya'}</span><span>{done?'Ulangi':unlocked?'Masuk level →':'Terkunci'}</span></span>
         <span className="level-question-dots">{topicExercises.map((q,qi)=><i key={q.id} className={q.words.every((_,wi)=>completed.includes(`${q.id}:${wi}`))?'done':''}/>)}</span>
        </button>
       </div>;
      })}
     </div>
     <div className="house-detail-footer"><span>🦉</span><p>Level yang sudah kamu selesaikan akan tetap tersimpan. Saat kembali, kamu bisa melanjutkan dari bagian yang belum selesai atau mengulang level untuk berlatih lagi.</p></div>
    </div>}
   </section>}
   {activeTab==='Jadi Guru'&&<section className="content-panel"><div className="section-heading"><div><span className="section-kicker">KOLABORASI PENGAJAR</span><h2>Daftar menjadi guru</h2></div><span className="library-count">Terbuka untuk semua</span></div><p className="panel-intro">Masuk dengan email terverifikasi, lalu isi formulir ini. Peran guru langsung aktif setelah formulir valid dikirim, tanpa persetujuan admin. Guru dapat melihat nama dan progres seluruh siswa.</p>{!user&&<button className="button-primary" onClick={()=>setShowLogin(true)}>Masuk / daftar dahulu</button>}<form className="teacher-application-form" onSubmit={submitTeacherApplication}><label className="field"><span>Nama lengkap</span><input required minLength={2} maxLength={120} value={teacherForm.fullName} onChange={e=>setTeacherForm(v=>({...v,fullName:e.target.value}))} placeholder="Nama sesuai identitas" /></label><label className="field"><span>Email aktif</span><input required type="email" maxLength={254} value={user?.email||''} readOnly placeholder="nama@email.com" /></label><label className="field"><span>Institusi / lembaga</span><input required minLength={2} maxLength={180} value={teacherForm.institution} onChange={e=>setTeacherForm(v=>({...v,institution:e.target.value}))} placeholder="Sekolah, kampus, pesantren, atau mandiri" /></label><label className="field"><span>Pengalaman mengajar (opsional)</span><textarea maxLength={1500} value={teacherForm.experience} onChange={e=>setTeacherForm(v=>({...v,experience:e.target.value}))} placeholder="Ceritakan pengalaman mengajar Nahwu / Bahasa Arab" rows={3}/></label><label className="field"><span>Alasan ingin bergabung</span><textarea required minLength={20} maxLength={2000} value={teacherForm.motivation} onChange={e=>setTeacherForm(v=>({...v,motivation:e.target.value}))} placeholder="Apa yang ingin kamu kontribusikan untuk Bedah I‘rab?" rows={4}/></label><label className="honeypot-field" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={teacherForm.website} onChange={e=>setTeacherForm(v=>({...v,website:e.target.value}))}/></label>{teacherFormMessage&&<div className="notice" role="status"><span>ⓘ</span>{teacherFormMessage}</div>}<button className="button-check" type="submit" disabled={!user||teacherFormBusy||user?.role==='Guru'||user?.role==='Admin'}>{teacherFormBusy?'Mendaftarkan…':user?.role==='Guru'?'Akun guru sudah aktif':'Daftar & aktifkan akun guru →'}</button></form><div className="role-note">Data formulir digunakan untuk profil pendaftaran guru. Email mengikuti akun yang sedang masuk. Jangan sertakan kata sandi atau informasi sensitif.</div></section>}
   {activeTab==='Progres'&&<section className="content-panel"><div className="section-heading"><div><span className="section-kicker">RIWAYAT BELAJAR</span><h2>Progres belajarmu</h2></div></div><p>{user?`Progres akun ${user.name} tersimpan online setelah sinkronisasi.`:'Riwayat pengunjung tersimpan di browser ini. Gunakan browser yang sama untuk review.'}</p><p role="status">{syncStatus}{pendingCount>0&&` · ${pendingCount} jawaban menunggu sinkron`}</p><div className="progress-hero"><div><h3>{completed.length} dari {totalWords} kata dikuasai</h3><p>Penguasaan menunjukkan jawaban yang sudah berhasil diselesaikan setelah latihan ulang jika diperlukan.</p></div><div className="progress-big"><strong>{Math.round(completed.length/totalWords*100)}%</strong><span>penguasaan kata</span></div></div><div className="progress-track large"><span style={{width:`${completed.length/totalWords*100}%`}}/></div><p>Progres versi kurikulum sebelumnya tetap tersimpan terpisah; nilai aktif dihitung dari bank soal v0.8.3.</p><div className="lesson-grid">{topics.map(topic=>{const qs=learningQuestions.filter(q=>q.topic===topic);const doneWords=qs.reduce((n,q)=>n+q.words.filter((_,i)=>completed.includes(`${q.id}:${i}`)).length,0);const totalWords=qs.reduce((n,q)=>n+q.words.length,0);const score=topicScore(topic,completed);return <article className="lesson-card" key={topic}><h3>{topic}</h3><p>{doneWords}/{totalWords} kata benar · {score}/100</p><button className="button-secondary small" disabled={progressLoading||(!canAccessAll&&!topicUnlocked(topic,completed))} onClick={()=>chooseExercise(qs[0])}>{canAccessAll||topicUnlocked(topic,completed)?'Buka / review':'Terkunci'}</button></article>;})}</div></section>}
   {activeTab==='Panel'&&user&&user.role!=='Siswa'&&<StaffPanel key={user.id} admin={user.role==='Admin'} onPractice={(id)=>{const q=learningQuestions.find(item=>item.id===id);if(q)chooseExercise(q);}}/>}
   {activeTab==='Saran'&&<FeedbackForm/>}
   <footer className="main-footer"><span>بِسْمِ الْعِلْمِ نَبْدَأُ</span><p>I‘rab Labs · Belajar Nahwu dengan memahami alasan.</p><span className="footer-version">I‘RAB LABS · V0.9.1</span></footer>
  </div></section>
  {showLogin&&<div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setShowLogin(false);}}><section className="login-modal" role="dialog" aria-modal="true" aria-labelledby="login-title"><button className="modal-close" onClick={()=>setShowLogin(false)} aria-label="Tutup">×</button><div className="modal-mark">بِ</div><div className="eyebrow">AKUN I‘RAB LABS</div><h2 id="login-title">Masuk ke ruang belajar</h2><p>{supabase?'Daftar atau masuk untuk menyimpan progres. Ingin menjadi guru? Isi formulir Jadi Guru setelah email terverifikasi.':'Login belum tersedia. Pengunjung tetap bisa latihan dan review di browser ini.'}</p>{authMode==='signup'&&<label className="field"><span>Nama lengkap</span><input value={loginName} onChange={e=>setLoginName(e.target.value)} placeholder="Nama kamu"/></label>}<label className="field"><span>Email</span><input type="email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} placeholder="nama@email.com"/></label><label className="field"><span>Kata sandi</span><input type="password" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} placeholder="Minimal sesuai aturan Supabase"/></label><div className="role-note">{authMode==='signup'?'Akun baru menjadi siswa. Setelah masuk, formulir Jadi Guru langsung mengaktifkan peran guru.':'Guru tidak memerlukan persetujuan admin. Gunakan menu Jadi Guru setelah masuk dengan email terverifikasi.'}</div>{notice&&<p className="notice" role="status">{notice}</p>}<button className="button-check" onClick={login}>{authMode==='signup'?'Daftar sebagai siswa →':'Masuk →'}</button><button className="feedback-link" onClick={()=>setAuthMode(authMode==='signin'?'signup':'signin')}>{authMode==='signin'?'Belum punya akun? Daftar sebagai siswa':'Sudah punya akun? Masuk'}</button><small className="modal-warning">{supabase?'Jaga kerahasiaan kata sandi akunmu.':'Riwayat pengunjung tersimpan di browser ini.'}</small></section></div>}
   {celebration&&<div className={`celebration-backdrop celebration-${celebration.kind}`} role="dialog" aria-modal="true" aria-labelledby="celebration-title" onClick={()=>setCelebration(null)}>
    <div className="celebration-card" onClick={e=>e.stopPropagation()}>
     <div className="celebration-confetti" aria-hidden="true"><span>✦</span><span>✿</span><span>✧</span><span>✦</span><span>❋</span><span>✧</span><span>✿</span><span>★</span><span>✦</span><span>✿</span><span>✧</span><span>❋</span><span>★</span><span>✦</span><span>✧</span></div>
     <div className="celebration-mascot"><Image width={600} height={600} src="/mascot.svg" alt="" /><span>{celebration.kind==='question'?'✨':celebration.kind==='topic'?'🔓':'🏆'}</span></div>
     <p className="celebration-eyebrow">{celebration.kind==='question'?'SATU TANTANGAN TERLEWATI':celebration.kind==='topic'?'MATERI BARU TERBUKA':'PERJALANAN BELAJAR SELESAI'}</p>
     <h2 id="celebration-title">{celebration.title}</h2>
     <p className="celebration-message">{celebration.message}</p>
     <div className="celebration-stars" aria-hidden="true">✦　✧　✦</div>
     <button className="celebration-continue" onClick={()=>setCelebration(null)}>{celebration.kind==='finish'?'Keren! 🎉':'Lanjut, yuk! →'}</button>
    </div>
   </div>}
 </main>;
}

