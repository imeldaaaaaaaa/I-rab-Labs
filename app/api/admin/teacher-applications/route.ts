import { createHash, randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { isResponse, requireAdmin } from '@/lib/server/admin-auth';
import { sendTransactionalEmail } from '@/lib/server/email';

type Application = {
  id: string; full_name: string; email: string; institution: string; experience: string;
  motivation: string; status: string; created_at: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ?? character);
}

export async function GET(request: Request) {
  const context = await requireAdmin(request);
  if (isResponse(context)) return context;
  const { data, error } = await context.admin
    .from('teacher_applications')
    .select('id, full_name, email, institution, experience, motivation, status, created_at')
    .in('status', ['pending', 'processing', 'approved', 'rejected'])
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: 'Daftar pengajuan tidak dapat dimuat. Periksa skema database.' }, { status: 500 });
  return NextResponse.json({ applications: (data ?? []) as Application[] });
}

export async function POST(request: Request) {
  const context = await requireAdmin(request);
  if (isResponse(context)) return context;
  const body = await request.json().catch(() => ({})) as { applicationId?: string; decision?: string };
  const applicationId = body.applicationId?.trim();
  const decision = body.decision;
  if (!applicationId || !['approve', 'reject'].includes(decision ?? '')) {
    return NextResponse.json({ error: 'ID pengajuan dan keputusan yang valid diperlukan.' }, { status: 400 });
  }

  const { data: application, error: lookupError } = await context.admin
    .from('teacher_applications')
    .select('id, full_name, email, institution, status')
    .eq('id', applicationId)
    .maybeSingle();
  if (lookupError || !application) return NextResponse.json({ error: 'Pengajuan tidak ditemukan.' }, { status: 404 });
  if (application.status !== 'pending') return NextResponse.json({ error: 'Pengajuan ini sudah diproses atau sedang diproses.' }, { status: 409 });

  if (decision === 'reject') {
    const { data: rejected, error } = await context.admin
      .from('teacher_applications')
      .update({ status: 'rejected', reviewed_by: context.userId, reviewed_at: new Date().toISOString() })
      .eq('id', applicationId)
      .eq('status', 'pending')
      .select('id')
      .maybeSingle();
    if (error || !rejected) return NextResponse.json({ error: 'Pengajuan gagal ditolak atau sudah diproses.' }, { status: 409 });
    return NextResponse.json({ ok: true, status: 'rejected' });
  }

  const baseUrl = process.env.APP_BASE_URL?.trim().replace(/\/$/, '');
  if (!baseUrl) return NextResponse.json({ error: 'APP_BASE_URL belum dikonfigurasi di environment server.' }, { status: 503 });
  try {
    const parsed = new URL(baseUrl);
    if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost') throw new Error('APP_BASE_URL harus menggunakan HTTPS (kecuali localhost).');
  } catch {
    return NextResponse.json({ error: 'APP_BASE_URL tidak valid. Gunakan URL website Bedah I‘rab.' }, { status: 503 });
  }
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    return NextResponse.json({ error: 'Email otomatis belum dikonfigurasi. Isi RESEND_API_KEY dan RESEND_FROM_EMAIL sebelum menyetujui pengajuan.' }, { status: 503 });
  }

  // Atomically claim the pending application so concurrent clicks cannot issue multiple invitations.
  const { data: claimed, error: claimError } = await context.admin
    .from('teacher_applications')
    .update({ status: 'processing' })
    .eq('id', applicationId)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle();
  if (claimError || !claimed) return NextResponse.json({ error: 'Pengajuan sudah diproses oleh tindakan lain.' }, { status: 409 });

  const rawCode = randomBytes(32).toString('base64url');
  const tokenHash = createHash('sha256').update(rawCode).digest('hex');
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
  const { data: invitation, error: invitationError } = await context.admin.from('role_invitations').insert({
    email: application.email.toLowerCase(),
    invited_role: 'teacher',
    token_hash: tokenHash,
    expires_at: expiresAt,
    created_by: context.userId,
  }).select('id').single();

  if (invitationError || !invitation) {
    await context.admin.from('teacher_applications').update({ status: 'pending' }).eq('id', applicationId).eq('status', 'processing');
    return NextResponse.json({ error: 'Undangan tidak dapat dibuat. Pastikan skema role_invitations sudah diterapkan.' }, { status: 500 });
  }

  // Use URL fragment so the one-time token is not sent in the HTTP request to the website server.
  const inviteUrl = `${baseUrl}/#invite=${encodeURIComponent(rawCode)}`;
  const safeName = escapeHtml(application.full_name);
  const sent = await sendTransactionalEmail({
    to: application.email,
    subject: 'Undangan menjadi guru Bedah I‘rab',
    text: `Assalamu'alaikum ${application.full_name},\n\nPengajuanmu untuk menjadi guru Bedah I‘rab telah disetujui. Buka tautan ini untuk mengaktifkan akses guru: ${inviteUrl}\n\nTautan berlaku selama 48 jam, hanya untuk email ${application.email}, dan hanya dapat digunakan sekali. Daftar atau masuk menggunakan email yang sama. Jika kamu tidak mengajukan ini, abaikan email ini.`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.7;color:#23352a;max-width:600px;margin:auto"><h2>Undangan Guru Bedah I‘rab</h2><p>Assalamu'alaikum ${safeName},</p><p>Pengajuanmu untuk menjadi guru Bedah I‘rab telah disetujui.</p><p>Gunakan tombol di bawah untuk membuka website dan mengaktifkan akses guru.</p><p><a href="${inviteUrl}" style="display:inline-block;background:#286443;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">Terima undangan guru</a></p><p>Tautan berlaku selama <strong>48 jam</strong>, hanya untuk email <strong>${escapeHtml(application.email)}</strong>, dan hanya dapat digunakan sekali. Daftar atau masuk menggunakan email yang sama.</p><p>Jika kamu tidak mengajukan ini, abaikan email ini.</p><p>Salam,<br/>Tim Bedah I‘rab</p></div>`,
  });

  if (!sent.ok) {
    await context.admin.from('role_invitations').delete().eq('id', invitation.id);
    await context.admin.from('teacher_applications').update({ status: 'pending' }).eq('id', applicationId).eq('status', 'processing');
    return NextResponse.json({ error: sent.error }, { status: 502 });
  }

  const { data: approved, error: approveError } = await context.admin
    .from('teacher_applications')
    .update({ status: 'approved', reviewed_by: context.userId, reviewed_at: new Date().toISOString() })
    .eq('id', applicationId)
    .eq('status', 'processing')
    .select('id')
    .maybeSingle();
  if (approveError || !approved) {
    // Do not delete an invitation after its email has been sent; the recipient must not receive a dead link.
    console.error('Invitation email sent but application status update failed:', applicationId, invitation.id);
    return NextResponse.json({ error: 'Email undangan terkirim, tetapi status pengajuan gagal diperbarui. Jangan menyetujui ulang; minta administrator teknis memeriksa status database.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status: 'approved', emailSent: true, expiresAt });
}

