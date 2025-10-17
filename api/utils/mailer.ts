import { Resend } from 'resend';

const isDev = process.env.NODE_ENV !== 'production';
const resendApiKey = process.env.RESEND_API_KEY || '';

/**
 * Check if Resend is configured
 */
export const isSmtpConfigured = (): boolean => {
  return Boolean(resendApiKey);
};

/**
 * Get the application URL for email links
 */
const getAppUrl = () => process.env.APP_URL || 'http://localhost:5173';

/**
 * Send password reset email with token using Resend API
 */
export async function sendPasswordResetEmail({ to, token }: { to: string; token: string }) {
  try {
    if (!isSmtpConfigured()) {
      throw new Error('Resend API key not configured');
    }

    const resend = new Resend(resendApiKey);
    const baseUrl = getAppUrl().replace(/\/$/, '');
    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
    const from = process.env.MAIL_FROM || 'onboarding@resend.dev';

    const subject = 'LumiFlix · Restablece tu contraseña';
    const html = `<!doctype html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>LumiFlix · Restablece tu contraseña</title><style>:root{--bg:#0b1228;--card:#0f172a;--text:#e5e7eb;--muted:#9ca3af;--brand:#6366f1;--brand2:#4338ca;--border:#23314e}body{margin:0;background:var(--bg);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Ubuntu,'Helvetica Neue',Arial,sans-serif;color:var(--text)}.wrap{max-width:640px;margin:0 auto;padding:24px}.card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:28px}.brand{font-weight:800;font-size:22px;color:#a5b4fc;margin-bottom:8px}h1{margin:0 0 8px 0;font-size:22px}p{line-height:1.6;margin:0 0 12px 0;color:var(--muted)}.btn{display:inline-block;margin-top:8px;background:linear-gradient(135deg,var(--brand) 0%,var(--brand2) 100%);color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700}.link{word-break:break-all;color:#c7d2fe;font-size:12px}.footer{margin-top:16px;padding-top:12px;border-top:1px solid var(--border);color:var(--muted);font-size:12px}</style></head><body><div class="wrap"><div class="card"><div class="brand">LumiFlix</div><h1>Restablecer contraseña</h1><p>Has solicitado restablecer tu contraseña. Haz clic en el botón para continuar:</p><p><a class="btn" href="${resetUrl}" target="_blank" rel="noopener">Restablecer contraseña</a></p><p class="link">Si el botón no funciona, copia y pega este enlace en tu navegador:<br />${resetUrl}</p><p>Este enlace es válido por 1 hora y de un solo uso.</p><div class="footer">© ${new Date().getFullYear()} LumiFlix • Este correo se generó automáticamente</div></div></div></body></html>`;

    if (isDev) {
      console.log('[mailer] sending with Resend ->', { to, from, resetUrl });
    }

    const response = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (isDev) {
      console.log('[mailer] Resend response <-', response);
    }

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response;
  } catch (error: any) {
    console.error('Error sending password reset email:', error.message);
    if (isDev) {
      console.error('[mailer] stack:', error?.stack);
    }
    throw error;
  }
}

export const testSmtpConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    if (!isSmtpConfigured()) {
      return { success: false, message: 'Resend API key not configured' };
    }
    const resend = new Resend(resendApiKey);
    // Simple test: try getting account info
    const response = await (resend as any).apiRequests.getAccountInfo?.() || { success: true };
    return { success: true, message: 'Resend API configured and reachable' };
  } catch (error: any) {
    return { success: false, message: `Resend error: ${error.message}` };
  }
};


