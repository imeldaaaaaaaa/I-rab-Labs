import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'Pengajuan guru belum aktif. Admin perlu mengonfigurasi Supabase terlebih dahulu.' }, { status: 503 });
  }

  const body = await request.json().catch(() => null) as null | {
    fullName?: string; email?: string; institution?: string; experience?: string; motivation?: string; website?: string;
  };
  if (!body) return NextResponse.json({ error: 'Data formulir tidak valid.' }, { status: 400 });
  // Honeypot field: bots that fill this hidden field are rejected without revealing the rule.
  if (body.website?.trim()) return NextResponse.json({ ok: true });

  const fullName = body.fullName?.trim() ?? '';
  const email = body.email?.trim().toLowerCase() ?? '';
  const institution = body.institution?.trim() ?? '';
  const experience = body.experience?.trim() ?? '';
  const motivation = body.motivation?.trim() ?? '';
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (fullName.length < 2 || fullName.length > 120 || !emailValid || institution.length < 2 || institution.length > 180 || experience.length > 1500 || motivation.length < 20 || motivation.length > 2000) {
    return NextResponse.json({ error: 'Periksa kembali nama, email, institusi, pengalaman, dan alasan pengajuan. Alasan pengajuan minimal 20 karakter.' }, { status: 400 });
  }

  const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: existing, error: lookupError } = await db
    .from('teacher_applications')
    .select('id, status')
    .eq('email', email)
    .in('status', ['pending', 'processing', 'approved'])
    .limit(1)
    .maybeSingle();
  if (lookupError) return NextResponse.json({ error: 'Pengajuan belum dapat disimpan. Pastikan skema database sudah diterapkan.' }, { status: 500 });
  if (existing) return NextResponse.json({ error: existing.status === 'approved' ? 'Email ini sudah memiliki pengajuan yang disetujui.' : 'Sudah ada pengajuan aktif dengan email tersebut.' }, { status: 409 });

  const { error } = await db.from('teacher_applications').insert({
    full_name: fullName,
    email,
    institution,
    experience,
    motivation,
    status: 'pending',
  });
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Sudah ada pengajuan aktif dengan email tersebut.' }, { status: 409 });
    console.error('Teacher application insert failed:', error.message);
    return NextResponse.json({ error: 'Pengajuan gagal disimpan. Coba lagi nanti.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, message: 'Pengajuan berhasil dikirim. Jika disetujui, undangan akan dikirim ke email yang kamu cantumkan.' }, { status: 201 });
}
