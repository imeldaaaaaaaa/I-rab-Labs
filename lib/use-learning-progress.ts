"use client";
import { useCallback,useEffect,useRef,useState } from 'react';
import { supabase } from './supabase/client';
import { CURRICULUM_VERSION,learningQuestions,gradeAnswer,type Answer } from '@/data/curriculum';
export type WordRecord={question_id:string;word_index:number;answer:Answer;correct:boolean;completed:boolean;attempts:number;updated_at:string};
type Pending={eventId:string;questionId:string;wordIndex:number;answer:Answer};
type Cache={records:Record<string,WordRecord>;pending:Pending[]};
const empty=():Cache=>({records:{},pending:[]});
function read(key:string):Cache{try{const v=JSON.parse(localStorage.getItem(key)||'null');return v&&v.records&&Array.isArray(v.pending)?v:empty();}catch{return empty();}}
export function useLearningProgress(userId:string|null,onlineAccount:boolean){
 const storageKey=`irab_${CURRICULUM_VERSION}_${userId||'guest'}`;
 const [cache,setCache]=useState<Cache>(empty),[loading,setLoading]=useState(true),[syncStatus,setSyncStatus]=useState(''),[answers,setAnswers]=useState<Record<string,Answer>>({});
 const cacheRef=useRef<Cache>(empty()),keyRef=useRef(storageKey),flushing=useRef(false);
 const persist=useCallback((value:Cache,key=keyRef.current)=>{if(key!==keyRef.current)return;cacheRef.current=value;setCache(value);try{localStorage.setItem(key,JSON.stringify(value));}catch{setSyncStatus('Penyimpanan browser penuh atau diblokir. Jangan tutup halaman sebelum tersinkron.');}},[]);
 const flush=useCallback(async()=>{
  if(!onlineAccount||!userId||!supabase||flushing.current||!cacheRef.current.pending.length)return;
  const key=storageKey;if(key!==keyRef.current)return;
  flushing.current=true;
  try{
   const {data:{session}}=await supabase.auth.getSession();if(!session||session.user.id!==userId)return;
   while(key===keyRef.current&&cacheRef.current.pending.length){
    const p=cacheRef.current.pending[0];
    const r=await fetch('/api/progress',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.access_token}`},body:JSON.stringify(p)});
    const d=await r.json();if(!r.ok)throw new Error(d.error||'Sinkronisasi gagal.');
    if(key!==keyRef.current)return;
    const record=d.record as WordRecord;
    persist({records:{...cacheRef.current.records,[`${record.question_id}:${record.word_index}`]:record},pending:cacheRef.current.pending.filter(x=>x.eventId!==p.eventId)},key);
   }
   if(key===keyRef.current)setSyncStatus('Tersimpan online');
  }catch(e){if(key===keyRef.current)setSyncStatus((e instanceof Error?e.message:'Koneksi terputus.')+' Jawaban ada di browser; tekan Sinkronkan saat koneksi kembali.');}
  finally{flushing.current=false;}
 },[onlineAccount,userId,storageKey,persist]);
 useEffect(()=>{
  let active=true;keyRef.current=storageKey;setLoading(true);setSyncStatus('');
  const local=read(storageKey);cacheRef.current=local;setCache(local);setAnswers(Object.fromEntries(Object.entries(local.records).map(([k,r])=>[k,r.answer])));
  if(!onlineAccount||!userId||!supabase){setLoading(false);return;}
  void (async()=>{try{
   const {data:{session}}=await supabase!.auth.getSession();if(!session||session.user.id!==userId)throw new Error('Sesi tidak tersedia.');
   const r=await fetch('/api/progress',{headers:{Authorization:`Bearer ${session.access_token}`},cache:'no-store'});const d=await r.json();if(!r.ok)throw new Error(d.error||'Riwayat gagal dimuat.');
   if(!active)return;
   const records:Record<string,WordRecord>=Object.fromEntries((d.records as WordRecord[]).map(r=>[`${r.question_id}:${r.word_index}`,r]));
   // Overlay unsent local answers only; cloud history is authoritative otherwise.
   for(const p of cacheRef.current.pending){const key=`${p.questionId}:${p.wordIndex}`;if(local.records[key])records[key]=local.records[key];}
   const merged={records,pending:cacheRef.current.pending};persist(merged,storageKey);setAnswers(Object.fromEntries(Object.entries(records).map(([k,r])=>[k,r.answer])));setSyncStatus('Tersimpan online');
  }catch(e){if(active)setSyncStatus((e instanceof Error?e.message:'Riwayat gagal dimuat.')+' Riwayat browser tetap tersedia.');}
  finally{if(active){setLoading(false);void flush();}}})();
  return()=>{active=false;};
 },[storageKey,onlineAccount,userId,persist,flush]);
 useEffect(()=>{const f=()=>{void flush();};window.addEventListener('online',f);const timer=window.setInterval(f,15000);return()=>{window.removeEventListener('online',f);window.clearInterval(timer);};},[flush]);
 function record(questionId:string,wordIndex:number,answer:Answer){
  if(loading)return;
  const q=learningQuestions.find(q=>q.id===questionId);if(!q)return;
  const key=`${questionId}:${wordIndex}`,old=cacheRef.current.records[key],correct=gradeAnswer(q,wordIndex,answer);
  const item:WordRecord={question_id:questionId,word_index:wordIndex,answer:old?.completed&&!correct?old.answer:answer,correct:correct||!!old?.completed,completed:correct||!!old?.completed,attempts:(old?.attempts||0)+1,updated_at:new Date().toISOString()};
  const pending=onlineAccount?[...cacheRef.current.pending,{eventId:crypto.randomUUID(),questionId,wordIndex,answer}]:[];
  persist({records:{...cacheRef.current.records,[key]:item},pending});void flush();
 }
 return {answers,setAnswers,records:cache.records,completed:Object.entries(cache.records).filter(([,r])=>r.completed).map(([k])=>k),record,loading,syncStatus,pendingCount:cache.pending.length,sync:flush};
}
