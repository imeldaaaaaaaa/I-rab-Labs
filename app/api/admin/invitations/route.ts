import { createHash, randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceKey) return NextResponse.json({ error: 'Supabase belum dikonfigurasi.' }, { status: 503 });
  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!bearer) return NextResponse.json({ error: 'Sesi admin diperlukan.' }, { status: 401 });
  const authClient = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data: { user }, error: authError } = await authClient.auth.getUser(bearer);
  if (authError || !user) return NextResponse.json({ error: 'Sesi login tidak valid.' }, { status: 401 });
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Hanya admin yang dapat membuat undangan.' }, { status: 403 });
  const body = await request.json().catch(() => ({})) as { email?: string; role?: string; expiresInDays?: number };
  const email = body.email?.trim().toLowerCase();
  const role = body.role;
  if (!email || !['teacher', 'admin'].includes(role || '')) return NextResponse.json({ error: 'Email dan role teacher/admin wajib diisi.' }, { status: 400 });
  const expiresInDays = Math.min(14, Math.max(1, Number(body.expiresInDays) || 7));
  const code = randomBytes(32).toString('base64url');
  const tokenHash = createHash('sha256').update(code).digest('hex');
  const { error } = await admin.from('role_invitations').insert({
    email,
    invited_role: role,
    token_hash: tokenHash,
    expires_at: new Date(Date.now() + expiresInDays * 86400000).toISOString(),
    created_by: user.id,
  });
  if (error) return NextResponse.json({ error: 'Undangan gagal dibuat.' }, { status: 500 });
  // Return the raw code only once; email delivery can be added as a separate trusted service.
  return NextResponse.json({ email, role, code, expiresInDays });
}

