type SendEmailInput = { to: string; subject: string; html: string; text: string };

export async function sendTransactionalEmail(input: SendEmailInput): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return { ok: false, error: 'Email belum dikonfigurasi. Isi RESEND_API_KEY dan RESEND_FROM_EMAIL di environment server.' };

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [input.to], subject: input.subject, html: input.html, text: input.text }),
      cache: 'no-store',
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error('Transactional email provider rejected request:', response.status, detail.slice(0, 500));
      return { ok: false, error: 'Layanan email gagal mengirim undangan. Periksa konfigurasi Resend dan alamat pengirim.' };
    }
    return { ok: true };
  } catch (error) {
    console.error('Transactional email request failed:', error);
    return { ok: false, error: 'Tidak dapat menghubungi layanan email. Coba lagi nanti.' };
  }
}

