import nodemailer from 'nodemailer'

/**
 * Crea y configura un transporter de Nodemailer con opciones optimizadas para evitar spam
 * @returns Transporter de Nodemailer configurado
 */
export const transporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: true, // true para puerto 465, false para otros puertos
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    // Opciones adicionales para mejorar la entrega
    pool: true, // Usar conexiones persistentes
    maxConnections: 5, // Limitar conexiones simultáneas
    maxMessages: 100, // Limitar mensajes por conexión
    rateDelta: 1000, // Tiempo entre envíos en ms
    rateLimit: 5, // Número máximo de mensajes por rateDelta
    // Opciones TLS
    tls: {
      rejectUnauthorized: true // Verificar certificado del servidor
    }
    // Opciones DKIM (requiere configuración adicional)
    // dkim: {
    //   domainName: 'cellus.com.ec',
    //   keySelector: 'email',
    //   privateKey: process.env.DKIM_PRIVATE_KEY,
    // }
  })
}

/**
 * Crea un objeto con la estructura para enviar un correo
 * @param from Remitente del correo
 * @param to Destinatario del correo
 * @param subject Asunto del correo
 * @param html Contenido HTML del correo
 * @returns Objeto con la estructura para enviar un correo
 */
export const transporterEmail = (
  from: string,
  to: string[] | string,
  subject: string,
  html: string,
  attachments?: {
    filename: string
    path: string
  }[]
) => {
  return {
    from,
    to,
    subject,
    html,
    attachments: attachments || null,
    // Opciones adicionales para mejorar la entrega
    headers: {
      'X-Priority': '1', // Prioridad alta
      'X-MSMail-Priority': 'High',
      Importance: 'High',
      'List-Unsubscribe': `<mailto:unsubscribe@cellus.com.ec?subject=Unsubscribe>`
    },
    // Versión en texto plano (recomendado para evitar spam)
    text: html.replace(/<[^>]*>/g, '') // Elimina etiquetas HTML
  }
}
