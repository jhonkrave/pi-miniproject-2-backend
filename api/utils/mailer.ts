import sgMail from '@sendgrid/mail';

const isDev = process.env.NODE_ENV !== 'production';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

/**
 * Check if SendGrid is configured
 */
export const isSmtpConfigured = (): boolean => {
  return Boolean(process.env.SENDGRID_API_KEY);
};

if (isDev) {
  console.log('[mailer] transport initialized:', isSmtpConfigured() ? 'SendGrid API' : 'Not configured');
}

/**
 * Get the application URL for email links
 */
const getAppUrl = () => process.env.APP_URL || 'http://localhost:5173';

/**
 * Send password reset email with token
 */
export async function sendPasswordResetEmail({ to, token }: { to: string; token: string }) {
  try {
    const from = process.env.MAIL_FROM || 'noreply@example.com';
    const baseUrl = getAppUrl().replace(/\/$/, ''); // Remove trailing slash if present
    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
    const subject = 'LumiFlix · Restablece tu contraseña';
    const text = `Hola,\n\nSolicitaste restablecer tu contraseña en LumiFlix.\n\nAbre este enlace (válido por 1 hora):\n${resetUrl}\n\nSi no fuiste tú, ignora este mensaje.\n\n— Equipo LumiFlix`;
    const html = `<!doctype html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>LumiFlix · Restablece tu contraseña</title><style>:root{--bg:#0b1228;--card:#0f172a;--text:#e5e7eb;--muted:#9ca3af;--brand:#6366f1;--brand2:#4338ca;--border:#23314e}body{margin:0;background:var(--bg);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Ubuntu,'Helvetica Neue',Arial,sans-serif;color:var(--text)}.wrap{max-width:640px;margin:0 auto;padding:24px}.card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:28px}.brand{font-weight:800;font-size:22px;color:#a5b4fc;margin-bottom:8px}h1{margin:0 0 8px 0;font-size:22px}p{line-height:1.6;margin:0 0 12px 0;color:var(--muted)}.btn{display:inline-block;margin-top:8px;background:linear-gradient(135deg,var(--brand) 0%,var(--brand2) 100%);color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700}.link{word-break:break-all;color:#c7d2fe;font-size:12px}.footer{margin-top:16px;padding-top:12px;border-top:1px solid var(--border);color:var(--muted);font-size:12px}</style></head><body><div class="wrap"><div class="card"><div class="brand">LumiFlix</div><h1>Restablecer contraseña</h1><p>Has solicitado restablecer tu contraseña. Haz clic en el botón para continuar:</p><p><a class="btn" href="${resetUrl}" target="_blank" rel="noopener">Restablecer contraseña</a></p><p class="link">Si el botón no funciona, copia y pega este enlace en tu navegador:<br />${resetUrl}</p><p>Este enlace es válido por 1 hora y de un solo uso.</p><div class="footer">© ${new Date().getFullYear()} LumiFlix • Este correo se generó automáticamente</div></div></div></body></html>`;
    
    if (isDev) {
      console.log('[mailer] send ->', { to, from, baseUrl, resetUrl });
    }

    const msg = {
      to,
      from,
      subject,
      text,
      html,
    };

    const info = await sgMail.send(msg);
    
    if (isDev) {
      console.log('[mailer] send <-', {
        messageId: (info as any)?.[0]?.messageId,
        statusCode: (info as any)?.[0]?.statusCode,
      });
    }
    
    return info;
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
      return { success: false, message: 'SendGrid API key not configured' };
    }
    
    // Simple test by checking if API key is set
    // SendGrid validates the key on first use
    return { success: true, message: 'SendGrid API key configured' };
  } catch (error: any) {
    return { success: false, message: `SendGrid error: ${error.message}` };
  }
};


