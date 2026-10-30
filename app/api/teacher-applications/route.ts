import { requireUser } from '@/lib/server/auth';
export async function POST(request:Request){
 const ctx=await requireUser(request);if(ctx instanceof Response)return ctx;
 if(!ctx.user.email_confirmed_at)return Response.json({error:'Verifikasi email akun sebelum mendaftar sebagai guru.'},{status:403});
 const b=await request.json().catch(()=>null);
 if(!b||typeof b!=='object')return Response.json({error:'Formulir tidak valid.'},{status:400});
 const field=(k:string)=>typeof b[k]==='string'?b[k].trim():'';
 const fullName=field('fullName'),institution=field('institution'),experience=field('experience'),motivation=field('motivation');
 if(field('website'))return Response.json({error:'Formulir tidak valid.'},{status:400});
 if(fullName.length<2||fullName.length>120||institution.length<2||institution.length>180||experience.length>1500||motivation.length<20||motivation.length>2000)return Response.json({error:'Periksa nama, institusi, dan alasan bergabung (minimal 20 karakter).'},{status:400});
 if(ctx.profile.role==='admin')return Response.json({error:'Akun admin sudah memiliki akses pengelolaan.'},{status:409});
 const {error}=await ctx.db.rpc('irab_register_teacher',{p_user:ctx.user.id,p_name:fullName,p_institution:institution,p_experience:experience,p_motivation:motivation});
 if(error)return Response.json({error:'Pendaftaran belum dapat disimpan. Pastikan migrasi v0.7 sudah dijalankan.'},{status:500});
 return Response.json({ok:true,role:'teacher',message:'Pendaftaran berhasil! Akun guru langsung aktif tanpa persetujuan admin.'});
}

