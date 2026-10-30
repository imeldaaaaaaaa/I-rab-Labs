import { createHmac } from 'node:crypto';
import { serviceDb,requireUser,noStore } from '@/lib/server/auth';
export async function POST(request:Request){
 let db:ReturnType<typeof serviceDb>;try{db=serviceDb();}catch{return Response.json({error:'Kotak saran belum tersedia.'},{status:503});}
 const b=await request.json().catch(()=>null);
 if(!b||typeof b!=='object'||typeof b.message!=='string'||b.message.trim().length<10||b.message.length>3000||!['Saran fitur','Koreksi materi','Laporan kendala','Lainnya'].includes(b.category))return Response.json({error:'Pilih kategori dan tulis saran sepanjang 10–3.000 karakter.'},{status:400});
 if(b.website)return Response.json({ok:true,message:'Terima kasih atas masukannya.'});
 let userId:string|null=null,role='guest';
 if(request.headers.has('authorization')){const ctx=await requireUser(request);if(ctx instanceof Response)return ctx;userId=ctx.user.id;role=ctx.profile.role;}
 // Vercel supplies the originating address. Never store a raw IP.
 const source=userId||request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'anonymous';
 const senderHash=createHmac('sha256',process.env.SUPABASE_SERVICE_ROLE_KEY!).update(source).digest('hex');
 const {error}=await db.rpc('irab_submit_feedback',{p_user:userId,p_role:role,p_hash:senderHash,p_category:b.category,p_message:b.message.trim()});
 if(error?.message.includes('RATE_LIMIT'))return Response.json({error:'Saran terlalu berdekatan. Tunggu satu menit; maksimal lima saran per jam.'},{status:429});
 if(error)return Response.json({error:'Saran belum terkirim. Pastikan migrasi v0.7 sudah dijalankan.'},{status:500});
 return Response.json({ok:true,message:'Terima kasih! Masukanmu sudah diterima pengembang.'},{status:201});
}
export async function GET(request:Request){
 const ctx=await requireUser(request);if(ctx instanceof Response)return ctx;
 if(ctx.profile.role!=='admin')return Response.json({error:'Khusus admin.'},{status:403});
 const page=Math.max(0,Math.min(100000,Math.floor(Number(new URL(request.url).searchParams.get('page'))||0)));
 const {data,error,count}=await ctx.db.from('irab_feedback').select('id,category,message,sender_role,status,created_at',{count:'exact'}).order('created_at',{ascending:false}).order('id').range(page*20,page*20+19);
 if(error)return Response.json({error:'Saran gagal dimuat.'},{status:500});
 return Response.json({items:data,count,page},{headers:noStore});
}
export async function PATCH(request:Request){
 const ctx=await requireUser(request);if(ctx instanceof Response)return ctx;
 if(ctx.profile.role!=='admin')return Response.json({error:'Khusus admin.'},{status:403});
 const b=await request.json().catch(()=>null);
 if(!b||typeof b.id!=='string'||!['baru','ditinjau','selesai'].includes(b.status))return Response.json({error:'Status tidak valid.'},{status:400});
 const {data,error}=await ctx.db.from('irab_feedback').update({status:b.status}).eq('id',b.id).select('id').maybeSingle();
 if(error)return Response.json({error:'Status gagal disimpan.'},{status:500});
 if(!data)return Response.json({error:'Saran tidak ditemukan.'},{status:404});
 return Response.json({ok:true});
}
