import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { transporter } from '../config/email';

/**
 * Función para enviar correos electrónicos usando plantillas HTML con variables dinámicas
 * @param to Dirección de correo del destinatario
 * @param subject Asunto del correo
 * @param templateName Nombre de la plantilla HTML (sin extensión)
 * @param variables Variables a reemplazar en la plantilla
 * @returns Promise con el resultado del envío
 */
export const sendTemplateEmail = async (
  to: string,
  subject: string,
  templateName: string,
  variables: Record<string, any>
) => {
  try {
    // Ruta a la plantilla
    const templatePath = path.join(
      __dirname,
      '../templates/emails',
      `${templateName}.html`
    );

    // Leer la plantilla
    const templateSource = fs.readFileSync(templatePath, 'utf-8');

    // Compilar la plantilla con Handlebars
    const template = Handlebars.compile(templateSource);

    // Aplicar las variables a la plantilla
    const html = template(variables);

    // Configurar opciones del correo con mejoras para evitar spam
    const mailOptions = {
      from: {
        name: 'CELLUS S.A',
        address: process.env.EMAIL_USER || 'noreply@cellus.com.ec'
      },
      to,
      subject,
      html,
      headers: {
        'X-Priority': '1', // Prioridad alta
        'X-MSMail-Priority': 'High',
        'Importance': 'High',
        // DKIM, SPF y DMARC deben configurarse en el servidor de correo
        'List-Unsubscribe': `<mailto:unsubscribe@cellus.com.ec?subject=Unsubscribe>`,
      }
    };

    // Enviar el correo
    const info = await transporter().sendMail(mailOptions);
    console.log('Correo enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error al enviar correo:', error);
    return { success: false, error };
  }
};

/**
 * Ejemplo de uso para enviar un correo de bienvenida
 * @param email Correo del usuario
 * @param fullName Nombre completo del usuario
 * @param username Nombre de usuario
 * @param password Contraseña inicial
 */
export const sendWelcomeEmail = async (
  email: string,
  fullName: string,
  username: string,
  password: string
) => {
  const variables = {
    fullName,
    username,
    password,
    domain: process.env.DOMAIN || 'https://cellus.com.ec',
    year: new Date().getFullYear()
  };

  return sendTemplateEmail(
    email,
    '¡Bienvenido/a a CELLUS S.A!',
    'welcome',
    variables
  );
};