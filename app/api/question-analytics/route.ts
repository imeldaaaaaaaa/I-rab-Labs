import { requireStaff,noStore } from '@/lib/server/auth';
import { CURRICULUM_VERSION,learningQuestions } from '@/data/curriculum';

type ProgressRow={student_id:string;question_id:string;word_index:number;completed:boolean;attempts:number;updated_at:string};

export async function GET(request:Request){
 const ctx=await requireStaff(request);
 if(ctx instanceof Response)return ctx;
 const allStudentIds=new Set<string>();
 let profileOffset=0;
 while(true){
  const {data,error}=await ctx.db.from('profiles').select('id').eq('role','student').order('id').range(profileOffset,profileOffset+999);
  if(error)return Response.json({error:'Daftar siswa untuk evaluasi gagal dimuat.'},{status:500});
  for(const p of data||[])allStudentIds.add(p.id);
  if(!data||data.length<1000)break;
  profileOffset+=1000;
 }
 const rows:ProgressRow[]=[];
 let offset=0;
 while(true){
  const {data,error}=await ctx.db.from('irab_word_progress')
   .select('student_id,question_id,word_index,completed,attempts,updated_at')
   .eq('curriculum_version',CURRICULUM_VERSION)
   .order('student_id').order('question_id').order('word_index')
   .range(offset,offset+999);
  if(error)return Response.json({error:'Data progres soal gagal dimuat.'},{status:500});
  const fetchedRows=(data||[]) as ProgressRow[];
  const batch=fetchedRows.filter(r=>allStudentIds.has(r.student_id));
  rows.push(...batch);
  if(!data||data.length<1000)break;
  offset+=1000;
 }
 const rowsByQuestion=new Map<string,ProgressRow[]>();
 for(const row of rows){const bucket=rowsByQuestion.get(row.question_id)||[];bucket.push(row);rowsByQuestion.set(row.question_id,bucket);}
 const analytics=learningQuestions.map(question=>{
  const qRows=rowsByQuestion.get(question.id)||[];
  const students=new Map<string,Map<number,ProgressRow>>();
  for(const row of qRows){
   if(!students.has(row.student_id))students.set(row.student_id,new Map());
   students.get(row.student_id)!.set(row.word_index,row);
  }
  const participants=students.size;
  let successfulStudents=0;
  for(const wordMap of students.values()){
   if(question.words.every((_,index)=>wordMap.get(index)?.completed===true))successfulStudents++;
  }
  const words=question.words.map((word,index)=>{
   const answered=[...students.values()].map(m=>m.get(index)).filter(Boolean) as ProgressRow[];
   const correct=answered.filter(r=>r.completed).length;
   const incorrect=answered.length-correct;
   return {
    word_index:index,token:word.token,position:word.position,
    answered_students:answered.length,correct_students:correct,incorrect_students:incorrect,
    success_rate:answered.length?Math.round(correct/answered.length*100):null,
    attempts:answered.reduce((n,r)=>n+r.attempts,0)
   };
  });
  return {
   question_id:question.id,participants,successful_students:successfulStudents,
   unsuccessful_students:participants-successfulStudents,
   success_rate:participants?Math.round(successfulStudents/participants*100):null,
   unsuccessful_rate:participants?Math.round((participants-successfulStudents)/participants*100):null,
   total_checks:qRows.reduce((n,r)=>n+r.attempts,0),
   words
  };
 });
 return Response.json({curriculum_version:CURRICULUM_VERSION,analytics,updated_at:new Date().toISOString()},{headers:noStore});
}
