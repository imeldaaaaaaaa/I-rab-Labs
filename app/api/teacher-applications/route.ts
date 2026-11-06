import { requireUser } from '@/lib/server/auth';

type ApplicationRow = {
  id: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at: string | null;
};

export async function GET(request: Request) {
  const context = await requireUser(request);
  if (context instanceof Response) return context;

  const email = context.user.email?.trim().toLowerCase();
  if (!email) return Response.json({ error: 'Email akun tidak tersedia.' }, { status: 400 });

  const { data, error } = await context.db
    .from('teacher_applications')
    .select('id, status, created_at, reviewed_at')
    .eq('email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Unable to load teacher application:', error);
    return Response.json({ error: 'Status pengajuan guru tidak dapat dimuat.' }, { status: 500 });
  }

  return Response.json({ application: (data ?? null) as ApplicationRow | null });
}

export async function POST(request: Request) {
  const context = await requireUser(request);
  if (context instanceof Response) return context;

  if (!context.user.email_confirmed_at) {
    return Response.json({ error: 'Verifikasi email akun sebelum mengajukan diri menjadi guru.' }, { status: 403 });
  }

  if (!context.user.email) {
    return Response.json({ error: 'Email akun tidak tersedia.' }, { status: 400 });
  }

  if (context.profile.role === 'admin') {
    return Response.json({ error: 'Akun admin sudah memiliki akses pengelolaan.' }, { status: 409 });
  }
  if (context.profile.role === 'teacher') {
    return Response.json({ error: 'Akun ini sudah memiliki akses guru.' }, { status: 409 });
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || typeof body !== 'object') {
    return Response.json({ error: 'Formulir tidak valid.' }, { status: 400 });
  }

  const field = (key: string) => typeof body[key] === 'string' ? (body[key] as string).trim() : '';
  const fullName = field('fullName');
  const institution = field('institution');
  const experience = field('experience');
  const motivation = field('motivation');

  if (field('website')) {
    return Response.json({ error: 'Formulir tidak valid.' }, { status: 400 });
  }
  if (
    fullName.length < 2 || fullName.length > 120 ||
    institution.length < 2 || institution.length > 180 ||
    experience.length > 1500 ||
    motivation.length < 20 || motivation.length > 2000
  ) {
    return Response.json({
      error: 'Periksa nama, institusi, dan alasan bergabung (minimal 20 karakter).',
    }, { status: 400 });
  }

  const email = context.user.email.trim().toLowerCase();
  const { data: activeApplication, error: lookupError } = await context.db
    .from('teacher_applications')
    .select('id, status')
    .eq('email', email)
    .in('status', ['pending', 'processing', 'approved'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    console.error('Unable to check existing teacher application:', lookupError);
    return Response.json({ error: 'Pengajuan sebelumnya tidak dapat diperiksa. Coba lagi nanti.' }, { status: 500 });
  }

  if (activeApplication?.status === 'pending') {
    return Response.json({ error: 'Pengajuanmu sudah diterima dan masih menunggu pemeriksaan admin.' }, { status: 409 });
  }
  if (activeApplication?.status === 'processing') {
    return Response.json({ error: 'Pengajuanmu sedang diproses oleh admin.' }, { status: 409 });
  }
  if (activeApplication?.status === 'approved') {
    return Response.json({ error: 'Pengajuanmu sudah disetujui. Periksa email untuk menerima undangan aktivasi guru.' }, { status: 409 });
  }

  const { data: application, error } = await context.db
    .from('teacher_applications')
    .insert({
      full_name: fullName,
      email,
      institution,
      experience,
      motivation,
      status: 'pending',
    })
    .select('id, status, created_at, reviewed_at')
    .single();

  if (error || !application) {
    console.error('Unable to create teacher application:', error);
    if (error?.code === '23505') {
      return Response.json({ error: 'Pengajuanmu sudah tercatat dan sedang menunggu pemeriksaan admin.' }, { status: 409 });
    }
    return Response.json({ error: 'Pengajuan belum dapat disimpan. Silakan coba lagi.' }, { status: 500 });
  }

  // Store the applicant's submitted display name without granting teacher privileges.
  const { error: profileError } = await context.db
    .from('profiles')
    .update({ full_name: fullName, updated_at: new Date().toISOString() })
    .eq('id', context.user.id);

  if (profileError) {
    console.error('Unable to update applicant display name:', profileError);
  }

  return Response.json({
    ok: true,
    application,
    message: 'Pengajuan berhasil dikirim. Akunmu tetap menjadi siswa sampai admin menyetujui pengajuan dan kamu menerima undangan melalui email.',
  }, { status: 201 });
}
