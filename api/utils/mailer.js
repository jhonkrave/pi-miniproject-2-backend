const nodemailer = require("nodemailer");

const createTransport = () => {
    if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
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

async function sendPasswordResetEmail({ to, token }) {
    const from = process.env.MAIL_FROM || "no-reply@example.com";
    const baseUrl = getAppUrl().replace(/\/$/, ''); // Remove trailing slash if present
    const resetUrl = `${baseUrl}/#/reset-password?token=${encodeURIComponent(token)}`;
    const subject = "🔐 Restablece tu contraseña - TaskFlow";
    const text = `Hola,\n\nRecibiste este correo porque solicitaste restablecer tu contraseña en TaskFlow.\n\nUsa este enlace para restablecer tu contraseña (válido 1 hora y de un solo uso):\n${resetUrl}\n\nSi no solicitaste este cambio, puedes ignorar este correo.\n\nSaludos,\nEl equipo de TaskFlow`;
    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Restablecer Contraseña - TaskFlow</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Inter', sans-serif; 
                background: linear-gradient(135deg, #F5E8D3 0%, #F0E6D2 100%);
                color: #000000;
                line-height: 1.6;
                padding: 20px;
            }
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background: linear-gradient(135deg, #fff 0%, #fefefe 100%);
                border-radius: 20px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.08);
                overflow: hidden;
                border: 1px solid rgba(0,0,0,0.06);
            }
            .header {
                background: linear-gradient(135deg, #A0522D, #8B4513);
                padding: 25px 30px;
                text-align: center;
                position: relative;
                overflow: hidden;
            }
            .header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(90deg, #A0522D, #FFD700, #A0522D);
            }
            .logo {
                font-size: 32px;
                font-weight: 700;
                color: #fff;
                margin-bottom: 8px;
                text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .tagline {
                color: rgba(255,255,255,0.9);
                font-size: 16px;
                font-weight: 400;
            }
            .content {
                padding: 35px 30px;
            }
            .greeting {
                font-size: 24px;
                font-weight: 600;
                color: #A0522D;
                margin-bottom: 20px;
                text-align: center;
            }
            .message {
                font-size: 16px;
                color: #4B5563;
                margin-bottom: 30px;
                text-align: center;
                line-height: 1.7;
            }
            .button-container {
                text-align: center;
                margin: 35px 0 25px 0;
            }
            .reset-button {
                display: inline-block;
                background: linear-gradient(135deg, #A0522D, #8B4513);
                color: #FFFFFF !important;
                text-decoration: none;
                padding: 16px 32px;
                border-radius: 12px;
                font-weight: 700;
                font-size: 16px;
                box-shadow: 0 4px 12px rgba(160, 82, 45, 0.3);
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
                text-shadow: 0 1px 2px rgba(0,0,0,0.3);
            }
            .reset-button::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transition: left 0.5s;
            }
            .reset-button:hover::before {
                left: 100%;
            }
            .reset-button:hover {
                background: linear-gradient(135deg, #8B4513, #A0522D);
                color: #FFFFFF !important;
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(160, 82, 45, 0.4);
            }
            .footer {
                background: #F5E8D3;
                padding: 25px;
                text-align: center;
                border-top: 1px solid rgba(160, 82, 45, 0.1);
            }
            .footer p {
                color: #4B5563;
                font-size: 14px;
                margin: 5px 0;
            }
            .footer .brand {
                color: #A0522D;
                font-weight: 600;
            }
            .divider {
                height: 1px;
                background: linear-gradient(90deg, transparent, #A0522D, transparent);
                margin: 20px 0;
            }
            .icon {
                font-size: 48px;
                color: #A0522D;
                margin-bottom: 20px;
                text-align: center;
            }
            @media (max-width: 600px) {
                .email-container { margin: 0; border-radius: 0; }
                .header { padding: 20px; }
                .content { padding: 25px 20px; }
                .footer { padding: 20px; }
                .greeting { font-size: 20px; }
                .message { font-size: 15px; }
                .reset-button { padding: 14px 28px; font-size: 15px; }
                .logo { font-size: 28px; }
                .button-container { margin: 30px 0 20px 0; }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo">📋 TaskFlow</div>
                <div class="tagline">Gestiona tus tareas de manera eficiente</div>
            </div>
            
            <div class="content">
                <div class="icon">🔐</div>
                <h1 class="greeting">¡Hola!</h1>
                <p class="message">
                    Recibiste este correo porque solicitaste restablecer tu contraseña en TaskFlow. 
                    Haz clic en el botón de abajo para crear una nueva contraseña segura.
                </p>
                
                <div class="button-container">
                    <a href="${resetUrl}" class="reset-button">Restablecer Contraseña</a>
                </div>
                
                <div class="divider"></div>
                
                <p class="message" style="font-size: 14px; color: #9CA3AF; margin-top: 20px;">
                    <strong>💡 Nota:</strong> Este enlace es válido por 1 hora y solo puede usarse una vez.<br>
                    Si no solicitaste este cambio, puedes ignorar este correo.
                </p>
                
                <p class="message" style="font-size: 13px; color: #9CA3AF; margin-top: 15px;">
                    Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                    <a href="${resetUrl}" style="color: #A0522D; word-break: break-all;">${resetUrl}</a>
                </p>
            </div>
            
            <div class="footer">
                <p><span class="brand">TaskFlow</span> - Tu compañero de productividad</p>
                <p>Este correo fue enviado automáticamente, por favor no respondas.</p>
            </div>
        </div>
    </body>
    </html>
    `;
    return transport.sendMail({ from, to, subject, text, html });
}

module.exports = { sendPasswordResetEmail };


