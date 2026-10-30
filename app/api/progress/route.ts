import { requireUser,noStore } from '@/lib/server/auth';
import { learningQuestions,gradeAnswer,CURRICULUM_VERSION,topicUnlocked,blank,type Answer } from '@/data/curriculum';
export async function GET(request:Request){
 const ctx=await requireUser(request);if(ctx instanceof Response)return ctx;
 const {data,error}=await ctx.db.from('irab_word_progress').select('question_id,word_index,answer,correct,completed,attempts,updated_at').eq('student_id',ctx.user.id).eq('curriculum_version',CURRICULUM_VERSION).order('question_id');
 if(error)return Response.json({error:'Riwayat belum dapat dimuat. Jalankan migrasi v0.7.'},{status:500});
 return Response.json({records:data},{headers:noStore});
}
export async function POST(request:Request){
 const ctx=await requireUser(request);if(ctx instanceof Response)return ctx;
 const b=await request.json().catch(()=>null);
 if(!b||typeof b!=='object')return Response.json({error:'Jawaban tidak valid.'},{status:400});
 const question=learningQuestions.find(q=>q.id===b.questionId),wi=b.wordIndex;
 if(!question||!Number.isInteger(wi)||wi<0||wi>=question.words.length||typeof b.eventId!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(b.eventId)||!b.answer||typeof b.answer!=='object')return Response.json({error:'Soal atau jawaban tidak valid.'},{status:400});
 const answer:Answer={...blank};for(const k of Object.keys(blank) as (keyof Answer)[]){if(typeof b.answer[k]!=='string'||b.answer[k].length>120)return Response.json({error:'Format jawaban tidak valid.'},{status:400});Object.assign(answer,{[k]:b.answer[k]});}
 if(question.topic!==learningQuestions[0].topic){
  const {data:done,error:readError}=await ctx.db.from('irab_word_progress').select('question_id,word_index').eq('student_id',ctx.user.id).eq('curriculum_version',CURRICULUM_VERSION).eq('completed',true);
  if(readError)return Response.json({error:'Progres belum dapat diperiksa.'},{status:500});
  if(!topicUnlocked(question.topic,(done||[]).map(r=>`${r.question_id}:${r.word_index}`)))return Response.json({error:'Selesaikan minimal 80% materi sebelumnya terlebih dahulu.'},{status:403});
 }
 const correct=gradeAnswer(question,wi,answer);
 const {data,error}=await ctx.db.rpc('irab_record_answer',{p_student:ctx.user.id,p_version:CURRICULUM_VERSION,p_question:question.id,p_word:wi,p_answer:answer,p_correct:correct,p_event:b.eventId});
 if(error)return Response.json({error:'Jawaban belum tersimpan online. Coba sinkronkan kembali.'},{status:500});
 return Response.json({record:data},{headers:noStore});
}
