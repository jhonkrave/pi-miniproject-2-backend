"use strict";
/**
 * @fileoverview Email utility module using SendGrid
 * @description Handles email sending functionality including password reset emails
 * and SMTP connection testing for the LumiFlix application
 * @author Equipo 8
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testSmtpConnection = exports.isSmtpConfigured = void 0;
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const mail_1 = __importDefault(require("@sendgrid/mail"));
/**
 * Development environment flag
 * @description Determines if the application is running in development mode
 * @type {boolean}
 */
const isDev = process.env.NODE_ENV !== 'production';
/**
 * Initialize SendGrid with API key
 * @description Sets the SendGrid API key from environment variables
 */
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY || '');
/**
 * Check if SendGrid is configured
 * @description Verifies if the SendGrid API key is properly set in environment variables
 * @returns {boolean} True if SendGrid API key is configured, false otherwise
 */
const isSmtpConfigured = () => {
    return Boolean(process.env.SENDGRID_API_KEY);
};
exports.isSmtpConfigured = isSmtpConfigured;
/**
 * Development logging for SendGrid initialization
 * @description Logs the transport initialization status in development mode
 */
if (isDev) {
    console.log('[mailer] transport initialized:', (0, exports.isSmtpConfigured)() ? 'SendGrid API' : 'Not configured');
}
/**
 * Get the application URL for email links
 * @description Retrieves the base application URL from environment variables or defaults to localhost
 * @returns {string} The application base URL
 */
const getAppUrl = () => process.env.APP_URL || 'http://localhost:5173';
/**
 * Send password reset email with token
 * @description Sends a password reset email to the specified recipient with a reset token
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email address
 * @param {string} params.token - Password reset token
 * @returns {Promise<any>} SendGrid response object
 * @throws {Error} When email sending fails
 */
async function sendPasswordResetEmail({ to, token }) {
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
        const info = await mail_1.default.send(msg);
        if (isDev) {
            console.log('[mailer] send <-', {
                messageId: info?.[0]?.messageId,
                statusCode: info?.[0]?.statusCode,
            });
        }
        return info;
    }
    catch (error) {
        console.error('Error sending password reset email:', error.message);
        if (isDev) {
            console.error('[mailer] stack:', error?.stack);
        }
        throw error;
    }
}
/**
 * Test SMTP connection
 * @description Tests the SendGrid SMTP connection by verifying API key configuration
 * @returns {Promise<{success: boolean, message: string}>} Test result object with success status and message
 */
const testSmtpConnection = async () => {
    try {
        if (!(0, exports.isSmtpConfigured)()) {
            return { success: false, message: 'SendGrid API key not configured' };
        }
        // Simple test by checking if API key is set
        // SendGrid validates the key on first use
        return { success: true, message: 'SendGrid API key configured' };
    }
    catch (error) {
        return { success: false, message: `SendGrid error: ${error.message}` };
    }
};
exports.testSmtpConnection = testSmtpConnection;
