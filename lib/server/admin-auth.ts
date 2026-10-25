import { createClient } from '@supabase/supabase-js';

export type AdminContext = {
  userId: string;
  email: string;
  admin: ReturnType<typeof createClient<any>>;
};

export async function requireAdmin(request: Request): Promise<AdminContext | Response> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceKey) {
    return Response.json({ error: 'Supabase belum dikonfigurasi.' }, { status: 503 });
  }

  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!bearer) return Response.json({ error: 'Sesi admin diperlukan.' }, { status: 401 });

  const authClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user }, error } = await authClient.auth.getUser(bearer);
  if (error || !user) return Response.json({ error: 'Sesi login tidak valid.' }, { status: 401 });

  const admin = createClient<any>(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: profile, error: profileError } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profileError || profile?.role !== 'admin') {
    return Response.json({ error: 'Hanya admin yang dapat melakukan tindakan ini.' }, { status: 403 });
  }
  return { userId: user.id, email: user.email ?? '', admin };
}

export function isResponse(value: AdminContext | Response): value is Response {
  return value instanceof Response;
}
