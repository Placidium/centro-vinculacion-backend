// services/emailService.js
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

class EmailService {
    async sendPasswordReset(email, resetToken, userName) {
        try {
            const resetLink = `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/auth/reset-password?token=${resetToken}`;

            const { data, error } = await resend.emails.send({
                from: process.env.FROM_EMAIL || 'Sistema Alerce <noreply@yourdomain.com>',
                to: [email],
                subject: 'Recuperación de Contraseña - Centro Integral Alerce',
                html: this.getPasswordResetTemplate(userName, resetLink)
            });

            if (error) {
                console.error('Error enviando email:', error);
                throw new Error('Error al enviar el correo');
            }

            console.log('Email enviado exitosamente:', data);
            return { success: true, messageId: data.id };

        } catch (error) {
            console.error('Error en sendPasswordReset:', error);
            throw error;
        }
    }

    getPasswordResetTemplate(userName, resetLink) {
        return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperación de Contraseña</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #166534; margin-bottom: 10px;">Centro Integral Alerce</h1>
            <h2 style="color: #374151; font-weight: normal;">Recuperación de Contraseña</h2>
        </div>
        
        <div style="background-color: #f9fafb; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <p style="margin-bottom: 15px;">Hola <strong>${userName}</strong>,</p>
            
            <p style="margin-bottom: 15px;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en el sistema de agendamiento del Centro Integral Alerce.
            </p>
            
            <p style="margin-bottom: 20px;">
                Si fuiste tú quien solicitó este cambio, haz clic en el siguiente botón:
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
                <a href="${resetLink}" 
                   style="background-color: #166534; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                   Restablecer Contraseña
                </a>
            </div>
            
            <p style="margin-bottom: 15px; font-size: 14px; color: #6b7280;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                <a href="${resetLink}" style="color: #166534; word-break: break-all;">${resetLink}</a>
            </p>
        </div>
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 14px;">
                <strong>⚠️ Importante:</strong> Este enlace expirará en 1 hora por seguridad.
            </p>
        </div>
        
        <div style="font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 15px;">
            <p>Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña permanecerá sin cambios.</p>
            <p style="margin-bottom: 0;">
                <strong>Centro Integral Alerce</strong><br>
                Sistema de Agendamiento
            </p>
        </div>
    </body>
    </html>
    `;
    }
}

module.exports = new EmailService();