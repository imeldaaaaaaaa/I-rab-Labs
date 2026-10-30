import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceKey) {
    return NextResponse.json({ error: 'Supabase belum dikonfigurasi.' }, { status: 503 });
  }
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ error: 'Sesi login diperlukan.' }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { code?: string };
  const code = body.code?.trim();
  if (!code || code.length < 20 || code.length > 256) {
    return NextResponse.json({ error: 'Kode undangan tidak valid.' }, { status: 400 });
  }
  const authClient = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data: { user }, error: authError } = await authClient.auth.getUser(token);
  if (authError || !user?.email) return NextResponse.json({ error: 'Sesi login tidak valid.' }, { status: 401 });
  if (!user.email_confirmed_at) return NextResponse.json({ error: 'Verifikasi email terlebih dahulu sebelum mengaktifkan role undangan.' }, { status: 403 });

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const tokenHash = createHash('sha256').update(code).digest('hex');
  const { data: invitation, error: inviteError } = await admin
    .from('role_invitations')
    .select('id, email, invited_role, expires_at, used_at')
    .eq('token_hash', tokenHash)
    .is('used_at', null)
    .maybeSingle();
  if (inviteError || !invitation || invitation.email.toLowerCase() !== user.email.toLowerCase() || new Date(invitation.expires_at) <= new Date()) {
    return NextResponse.json({ error: 'Undangan tidak ditemukan, sudah digunakan, kedaluwarsa, atau email tidak cocok.' }, { status: 403 });
  }
  const { data: claimed, error: claimError } = await admin
    .from('role_invitations')
    .update({ used_at: new Date().toISOString() })
    .eq('id', invitation.id)
    .is('used_at', null)
    .select('id')
    .maybeSingle();
  if (claimError || !claimed) return NextResponse.json({ error: 'Undangan sudah digunakan atau gagal diproses.' }, { status: 409 });
  const { error: roleError } = await admin.from('profiles').update({ role: invitation.invited_role }).eq('id', user.id);
  if (roleError) {
    // Restore invite usability if role assignment failed.
    await admin.from('role_invitations').update({ used_at: null }).eq('id', invitation.id);
    return NextResponse.json({ error: 'Role akun gagal diperbarui.' }, { status: 500 });
  }
  return NextResponse.json({ role: invitation.invited_role });
}

