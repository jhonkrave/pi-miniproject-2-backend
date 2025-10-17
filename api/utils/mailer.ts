import nodemailer from 'nodemailer';

const createTransport = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return nodemailer.createTransport({ jsonTransport: true });
};

const transport = createTransport();
const getAppUrl = () => process.env.APP_URL || `http://localhost:5173`;

export async function sendPasswordResetEmail({ to, token }: { to: string, token: string }) {
  const from = process.env.MAIL_FROM || 'no-reply@example.com';
  const baseUrl = getAppUrl().replace(/\/$/, '');
  const resetUrl = `${baseUrl}/#/reset-password?token=${encodeURIComponent(token)}`;
  const subject = '🔐 Restablece tu contraseña - TaskFlow';
  const text = `Hola,\n\nRecibiste este correo porque solicitaste restablecer tu contraseña en TaskFlow.\n\nUsa este enlace para restablecer tu contraseña (válido 1 hora y de un solo uso):\n${resetUrl}\n\nSi no solicitaste este cambio, puedes ignorar este correo.\n\nSaludos,\nEl equipo de TaskFlow`;
  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Restablecer Contraseña - TaskFlow</title></head><body><p>Restablece tu contraseña:</p><p><a href="${resetUrl}">Restablecer Contraseña</a></p></body></html>`;
  return transport.sendMail({ from, to, subject, text, html });
}


