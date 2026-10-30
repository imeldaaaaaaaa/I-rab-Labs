import { createClient } from '@supabase/supabase-js';
export function serviceDb(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)throw new Error('Supabase belum dikonfigurasi.');
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
export async function requireUser(request:Request){
 const token=request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
 if(!token)return Response.json({error:'Silakan masuk terlebih dahulu.'},{status:401});
 let db:ReturnType<typeof serviceDb>;try{db=serviceDb();}catch{return Response.json({error:'Supabase belum dikonfigurasi.'},{status:503});}
 const {data:{user},error}=await db.auth.getUser(token);
 if(error||!user)return Response.json({error:'Sesi berakhir. Silakan masuk kembali.'},{status:401});
 const {data:profile,error:profileError}=await db.from('profiles').select('id,full_name,role').eq('id',user.id).maybeSingle();
 if(profileError||!profile)return Response.json({error:'Profil belum tersedia.'},{status:403});
 return {db,user,profile};
}
export async function requireStaff(request:Request){const ctx=await requireUser(request);if(ctx instanceof Response)return ctx;if(!['teacher','admin'].includes(ctx.profile.role))return Response.json({error:'Akses khusus guru dan admin.'},{status:403});return ctx;}
export const noStore={'Cache-Control':'private, no-store'};
