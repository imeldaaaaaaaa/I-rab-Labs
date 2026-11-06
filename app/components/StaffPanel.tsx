"use client";
import { useCallback,useEffect,useMemo,useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { learningQuestions,topics } from '@/data/curriculum';
import type { WordRecord } from '@/lib/use-learning-progress';

type Student={id:string;full_name:string;correct_words?:number;attempts?:number;last_active?:string};
type Feedback={id:string;category:string;message:string;sender_role:string;status:string;created_at:string};
type TeacherApplication={id:string;full_name:string;email:string;institution:string;experience:string;motivation:string;status:'pending'|'processing'|'approved'|'rejected';created_at:string;reviewed_at:string|null};
type WordStat={word_index:number;token:string;position:string;answered_students:number;correct_students:number;incorrect_students:number;success_rate:number|null;attempts:number};
type QuestionStat={question_id:string;participants:number;successful_students:number;unsuccessful_students:number;success_rate:number|null;unsuccessful_rate:number|null;total_checks:number;words:WordStat[]};
async function api(path:string,init:RequestInit={}){if(!supabase)throw Error('Supabase belum terhubung.');const {data:{session}}=await supabase.auth.getSession();if(!session)throw Error('Silakan masuk kembali.');const r=await fetch(path,{...init,headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.access_token}`},cache:'no-store'});const d=await r.json();if(!r.ok)throw Error(d.error||'Permintaan gagal.');return d;}
export default function StaffPanel({admin,onPractice}:{admin:boolean;onPractice:(questionId:string)=>void}){
 const [students,setStudents]=useState<Student[]>([]),[page,setPage]=useState(0),[count,setCount]=useState(0),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [detail,setDetail]=useState<{student:Student;records:WordRecord[]}|null>(null),[feedback,setFeedback]=useState<Feedback[]>([]),[feedbackPage,setFeedbackPage]=useState(0),[feedbackCount,setFeedbackCount]=useState(0),[feedbackBusy,setFeedbackBusy]=useState(false);
 const [applications,setApplications]=useState<TeacherApplication[]>([]),[applicationsBusy,setApplicationsBusy]=useState(false),[applicationsError,setApplicationsError]=useState(''),[applicationsNotice,setApplicationsNotice]=useState(''),[applicationAction,setApplicationAction]=useState('');
 const [analytics,setAnalytics]=useState<QuestionStat[]>([]),[analyticsBusy,setAnalyticsBusy]=useState(false),[analyticsError,setAnalyticsError]=useState(''),[topicFilter,setTopicFilter]=useState('Semua submateri'),[search,setSearch]=useState('');
 const load=useCallback(async()=>{setBusy(true);setError('');try{const d=await api(`/api/students?page=${page}`);setStudents(d.students);setCount(d.count);}catch(e){setError((e as Error).message);setStudents([]);}finally{setBusy(false);}},[page]);
 const loadFeedback=useCallback(async()=>{if(!admin)return;setFeedbackBusy(true);try{const d=await api(`/api/feedback?page=${feedbackPage}`);setFeedback(d.items);setFeedbackCount(d.count);}catch(e){setError((e as Error).message);}finally{setFeedbackBusy(false);}},[admin,feedbackPage]);
 const loadAnalytics=useCallback(async()=>{setAnalyticsBusy(true);setAnalyticsError('');try{const d=await api('/api/question-analytics');setAnalytics(d.analytics||[]);}catch(e){setAnalyticsError((e as Error).message);setAnalytics([]);}finally{setAnalyticsBusy(false);}},[]);
 const loadApplications=useCallback(async()=>{if(!admin)return;setApplicationsBusy(true);setApplicationsError('');try{const d=await api('/api/admin/teacher-applications');setApplications(d.applications||[]);}catch(e){setApplicationsError((e as Error).message);setApplications([]);}finally{setApplicationsBusy(false);}},[admin]);
 async function decideApplication(applicationId:string,decision:'approve'|'reject'){
  setApplicationAction(applicationId);setApplicationsError('');setApplicationsNotice('');
  try{
   await api('/api/admin/teacher-applications',{method:'POST',body:JSON.stringify({applicationId,decision})});
   setApplicationsNotice(decision==='approve'?'Pengajuan disetujui. Undangan aktivasi guru berhasil dikirim ke email pemohon.':'Pengajuan guru telah ditolak.');
   await loadApplications();
  }catch(e){setApplicationsError((e as Error).message);}
  finally{setApplicationAction('');}
 }
 useEffect(()=>{void load();},[load]);useEffect(()=>{void loadFeedback();},[loadFeedback]);useEffect(()=>{void loadAnalytics();},[loadAnalytics]);useEffect(()=>{void loadApplications();},[loadApplications]);
 async function openStudent(id:string){setBusy(true);setDetail(null);setError('');try{setDetail(await api(`/api/students?student=${id}`));}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 async function changeStatus(id:string,status:string){setFeedbackBusy(true);try{await api('/api/feedback',{method:'PATCH',body:JSON.stringify({id,status})});await loadFeedback();}catch(e){setError((e as Error).message);}finally{setFeedbackBusy(false);}}
 const filteredQuestions=useMemo(()=>learningQuestions.filter(q=>(topicFilter==='Semua submateri'||q.topic===topicFilter)&&(`${q.sentence} ${q.translation} ${q.topic}`.toLowerCase().includes(search.toLowerCase()))),[topicFilter,search]);
 const statsById=useMemo(()=>new Map<string,QuestionStat>(analytics.map(a=>[a.question_id,a] as const)),[analytics]);
 return <section className="content-panel">
  <div className="section-heading"><div><span className="section-kicker">PANTAU PEMBELAJARAN</span><h2>Progres seluruh siswa</h2></div><button className="button-secondary small" disabled={busy} onClick={()=>{setDetail(null);void load();}}>Muat ulang</button></div>
  <p>Menampilkan penguasaan soal, jumlah pemeriksaan jawaban, dan aktivitas terakhir. Data diperbarui saat siswa menyinkronkan jawabannya.</p>{error&&<p className="notice" role="alert">{error}</p>}<p role="status">{busy?'Memuat progres…':`${count} akun siswa`}</p>
  <div className="table-wrap"><table><thead><tr><th>Nama siswa</th><th>Kata dikuasai</th><th>Pemeriksaan jawaban</th><th>Aktivitas terakhir</th><th>Detail</th></tr></thead><tbody>{students.map(s=><tr key={s.id}><td>{s.full_name||'Siswa'}</td><td>{s.correct_words||0}</td><td>{s.attempts||0}</td><td>{s.last_active?new Date(s.last_active).toLocaleString('id-ID'):'Belum belajar'}</td><td><button className="button-secondary small" disabled={busy} onClick={()=>void openStudent(s.id)}>Lihat materi</button></td></tr>)}{!busy&&!students.length&&<tr><td colSpan={5}>Belum ada siswa.</td></tr>}</tbody></table></div>
  <div className="review-nav"><button className="button-secondary small" disabled={page===0||busy} onClick={()=>{setDetail(null);setPage(p=>p-1);}}>Sebelumnya</button><span>Halaman {page+1}</span><button className="button-secondary small" disabled={(page+1)*20>=count||busy} onClick={()=>{setDetail(null);setPage(p=>p+1);}}>Berikutnya</button></div>
  {detail&&<div className="student-detail"><div className="section-heading"><h3>Progres {detail.student.full_name||'Siswa'}</h3><button className="button-secondary small" onClick={()=>setDetail(null)}>Tutup detail</button></div><p>Persentase menunjukkan soal yang seluruh katanya sudah berhasil dijawab, setelah latihan ulang jika diperlukan.</p><div className="table-wrap"><table><thead><tr><th>Materi</th><th>Soal dikuasai</th><th>Penguasaan</th><th>Pemeriksaan</th><th>Terakhir belajar</th></tr></thead><tbody>{topics.map(topic=>{const qs=learningQuestions.filter(q=>q.topic===topic);const records=detail.records.filter(r=>qs.some(q=>q.id===r.question_id));const done=qs.filter(q=>q.words.every((_,i)=>records.some(r=>r.question_id===q.id&&r.word_index===i&&r.completed))).length;const last=records.map(r=>r.updated_at).sort().at(-1);return <tr key={topic}><td>{topic}</td><td>{done}/3</td><td>{Math.round(done/3*100)}%</td><td>{records.reduce((sum,r)=>sum+r.attempts,0)}</td><td>{last?new Date(last).toLocaleString('id-ID'):'—'}</td></tr>;})}</tbody></table></div></div>}
  <section className="question-evaluation">
   <div className="section-heading"><div><span className="section-kicker">BANK SOAL & ANALISIS</span><h2>Evaluasi seluruh soal</h2></div><button className="button-secondary small" disabled={analyticsBusy} onClick={()=>void loadAnalytics()}>{analyticsBusy?'Memuat…':'Perbarui data'}</button></div>
   <p>Guru dan admin dapat membuka semua soal, melihat kunci serta pembahasan, dan mencoba mengerjakannya. Statistik hanya menggunakan akun siswa; aktivitas latihan guru/admin tidak masuk ke statistik siswa.</p>
   {analyticsError&&<p className="notice" role="alert">{analyticsError}</p>}
   <div className="question-evaluation-filters"><label className="field"><span>Filter submateri</span><select value={topicFilter} onChange={e=>setTopicFilter(e.target.value)}><option>Semua submateri</option>{topics.map(t=><option key={t}>{t}</option>)}</select></label><label className="field"><span>Cari soal</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari teks Arab, terjemahan, atau materi…"/></label></div>
   <p className="question-count">{filteredQuestions.length} soal ditampilkan · {analyticsBusy?'Memuat statistik…':`${analytics.length} soal dalam evaluasi`}</p>
   <div className="question-evaluation-list">{filteredQuestions.map((q,i)=>{const stat=statsById.get(q.id);const pct=stat?.success_rate;return <details className="question-evaluation-card" key={q.id}>
    <summary><div className="question-evaluation-summary"><span className="question-evaluation-number">{String(i+1).padStart(2,'0')}</span><div className="question-evaluation-title"><strong>{q.topic} · {q.difficulty}</strong><span dir="rtl" lang="ar">{q.sentence}</span><small>{q.translation}</small></div><div className="question-evaluation-rate"><strong>{pct===null||pct===undefined?'—':`${pct}%`}</strong><small>{stat?.participants||0} siswa</small></div></div></summary>
    <div className="question-evaluation-body">
     <div className="question-stat-grid"><div><strong>{stat?.participants||0}</strong><span>Siswa mencoba</span></div><div><strong>{stat?.successful_students||0}</strong><span>Berhasil semua kata</span></div><div><strong>{stat?.unsuccessful_students||0}</strong><span>Belum tuntas</span></div><div><strong>{stat?.total_checks||0}</strong><span>Total pemeriksaan</span></div></div>
     {stat?.participants? <><div className="question-rate-bar" aria-label={`Berhasil ${stat.success_rate} persen, belum berhasil ${stat.unsuccessful_rate} persen`}><span style={{width:`${stat.success_rate}%`}}/><i style={{width:`${stat.unsuccessful_rate}%`}}/></div><div className="question-rate-labels"><span>Berhasil: {stat.success_rate}%</span><span>Belum tuntas: {stat.unsuccessful_rate}%</span></div></>:<p className="no-question-data">Belum ada data pengerjaan dari siswa untuk soal ini.</p>}
     <div className="question-answer-key"><h4>Kunci analisis dan pembahasan</h4>{q.analysisGroups?.filter(g=>g.indices.length>1).map((g,gi)=><div className="answer-group-key" key={gi}><strong>{g.label}: <span dir="rtl">{g.indices.map(index=>q.words[index].token).join(' ')}</span></strong><p>{g.functionLabel}. {g.explanation}</p><small>Petunjuk siswa: {g.hint}</small></div>)}{q.words.map((w,wi)=>{const ws=stat?.words.find(x=>x.word_index===wi);return <div className="answer-word-key" key={`${q.id}-${wi}`}><div><strong dir="rtl" lang="ar">{w.token}</strong><span>{w.position} · {w.state} · {w.sign}</span><small>{w.fullIrab}</small><p>{w.explanation}</p></div><div className="answer-word-stat"><strong>{ws?.success_rate===null||ws?.success_rate===undefined?'—':`${ws.success_rate}%`}</strong><small>{ws?.correct_students||0}/{ws?.answered_students||0} benar</small></div></div>;})}</div>
     <div className="question-evaluation-actions"><button className="button-primary" onClick={()=>onPractice(q.id)}>Coba kerjakan soal ini →</button></div>
    </div>
   </details>;})}</div>
  </section>
  {admin&&<section className="teacher-applications-admin">
   <div className="section-heading"><div><span className="section-kicker">AKSES PENGAJAR</span><h2>Pengajuan menjadi guru</h2></div><button className="button-secondary small" disabled={applicationsBusy} onClick={()=>void loadApplications()}>{applicationsBusy?'Memuat…':'Muat ulang'}</button></div>
   <p>Periksa identitas dan alasan calon guru. Persetujuan akan mengirim undangan satu kali ke email pemohon; role guru baru aktif setelah pemohon menerima undangan tersebut.</p>
   {applicationsError&&<p className="notice" role="alert">{applicationsError}</p>}
   {applicationsNotice&&<p className="notice" role="status">{applicationsNotice}</p>}
   {applicationsBusy&&!applications.length&&<p role="status">Memuat pengajuan guru…</p>}
   <div className="teacher-application-admin-list">
    {applications.map(application=><article className="admin-card teacher-application-admin-card" key={application.id}>
     <div className="section-heading"><div><strong>{application.full_name}</strong><small>{application.email}</small></div><span className={`application-status ${application.status}`}>{application.status==='pending'?'Menunggu':application.status==='processing'?'Diproses':application.status==='approved'?'Disetujui':'Ditolak'}</span></div>
     <p><strong>Institusi:</strong> {application.institution}</p>
     {application.experience&&<p><strong>Pengalaman:</strong> {application.experience}</p>}
     <p className="feedback-message"><strong>Motivasi:</strong> {application.motivation}</p>
     <small>Diajukan: {new Date(application.created_at).toLocaleString('id-ID')}</small>
     {application.status==='pending'&&<div className="application-actions"><button className="button-primary small" disabled={!!applicationAction||applicationsBusy} onClick={()=>void decideApplication(application.id,'approve')}>{applicationAction===application.id?'Memproses…':'Setujui & kirim undangan'}</button><button className="button-secondary small" disabled={!!applicationAction||applicationsBusy} onClick={()=>{if(window.confirm(`Tolak pengajuan ${application.full_name}?`))void decideApplication(application.id,'reject');}}>Tolak</button></div>}
     {application.status==='approved'&&<p className="application-helper">Undangan aktivasi telah dikirim ke email pemohon. Role guru aktif setelah tautan diterima.</p>}
     {application.status==='processing'&&<p className="application-helper">Pengajuan sedang diproses. Muat ulang beberapa saat lagi.</p>}
    </article>)}
    {!applicationsBusy&&!applications.length&&<p>Belum ada pengajuan guru.</p>}
   </div>
  </section>}
  {admin&&<section className="feedback-admin"><div className="section-heading"><h2>Masukan untuk pengembang</h2><button className="button-secondary small" disabled={feedbackBusy} onClick={()=>void loadFeedback()}>Muat ulang</button></div>{feedbackBusy&&<p role="status">Memuat saran…</p>}<div className="feedback-list">{feedback.map(f=><article className="admin-card" key={f.id}><div className="section-heading"><strong>{f.category}</strong><small>{new Date(f.created_at).toLocaleString('id-ID')}</small></div><small>Pengirim: {f.sender_role==='guest'?'Pengunjung':f.sender_role==='student'?'Siswa':f.sender_role==='teacher'?'Guru':'Admin'}</small><p className="feedback-message">{f.message}</p><label>Status <select aria-label="Status saran" value={f.status} disabled={feedbackBusy} onChange={e=>void changeStatus(f.id,e.target.value)}><option value="baru">Baru</option><option value="ditinjau">Ditinjau</option><option value="selesai">Selesai</option></select></label></article>)}{!feedback.length&&!feedbackBusy&&<p>Belum ada saran.</p>}</div><div className="review-nav"><button className="button-secondary small" disabled={!feedbackPage||feedbackBusy} onClick={()=>setFeedbackPage(p=>p-1)}>Sebelumnya</button><span>Halaman {feedbackPage+1}</span><button className="button-secondary small" disabled={(feedbackPage+1)*20>=feedbackCount||feedbackBusy} onClick={()=>setFeedbackPage(p=>p+1)}>Berikutnya</button></div></section>}
 </section>;
}
