import { requireStaff,noStore } from '@/lib/server/auth';
import { CURRICULUM_VERSION } from '@/data/curriculum';
export async function GET(request:Request){
 const ctx=await requireStaff(request);if(ctx instanceof Response)return ctx;
 const url=new URL(request.url),id=url.searchParams.get('student');
 if(id){
  if(!/^[0-9a-f-]{36}$/i.test(id))return Response.json({error:'ID siswa tidak valid.'},{status:400});
  const {data:student}=await ctx.db.from('profiles').select('id,full_name').eq('id',id).eq('role','student').maybeSingle();
  if(!student)return Response.json({error:'Siswa tidak ditemukan.'},{status:404});
  const {data,error}=await ctx.db.from('irab_word_progress').select('question_id,word_index,completed,attempts,updated_at').eq('student_id',id).eq('curriculum_version',CURRICULUM_VERSION);
  if(error)return Response.json({error:'Progres siswa gagal dimuat.'},{status:500});
  return Response.json({student,records:data},{headers:noStore});
 }
 const page=Math.max(0,Math.min(100000,Math.floor(Number(url.searchParams.get('page'))||0)));
 const {data:students,error,count}=await ctx.db.from('profiles').select('id,full_name,created_at',{count:'exact'}).eq('role','student').order('created_at',{ascending:false}).order('id').range(page*20,page*20+19);
 if(error)return Response.json({error:'Daftar siswa gagal dimuat.'},{status:500});
 if(!students?.length)return Response.json({students:[],count:count??0,page},{headers:noStore});
 const {data:stats,error:statsError}=await ctx.db.rpc('irab_student_summaries',{p_students:students.map(s=>s.id),p_version:CURRICULUM_VERSION});
 if(statsError)return Response.json({error:'Ringkasan progres belum tersedia. Jalankan migrasi v0.7.'},{status:500});
 return Response.json({students:students.map(s=>({...s,...(stats as {student_id:string}[])?.find(r=>r.student_id===s.id)})),count:count??0,page},{headers:noStore});
}
