import fs from 'node:fs'
import path from 'node:path'
import Handlebars from 'handlebars'
import { transporter, transporterEmail } from '~/config/email'
import { format } from '@formkit/tempo'
import { generatePassword } from '../generateUniqueId'

/**
 * Envía correos electrónicos usando plantillas HTML con variables dinámicas
 *
 * Esta función utiliza Handlebars para compilar plantillas HTML y reemplazar
 * variables dinámicas. Las plantillas deben estar ubicadas en el directorio
 * `src/templates/emails/` con extensión `.html`.
 *
 * @async
 * @param {string} to - Dirección de correo electrónico del destinatario
 * @param {string} subject - Asunto del correo electrónico
 * @param {string} templateName - Nombre de la plantilla HTML (sin extensión .html)
 * @param {Record<string, any>} variables - Objeto con variables a reemplazar en la plantilla
 * @returns {Promise<{success: boolean, messageId?: string, error?: any}>} Resultado del envío
 *
 * @example
 * ```typescript
 * const result = await sendTemplateEmail(
 *   'usuario@example.com',
 *   'Bienvenido a Cellus',
 *   'welcome',
 *   { fullName: 'Juan Pérez', company: 'Cellus' }
 * )
 * if (result.success) {
 *   console.log('Email enviado:', result.messageId)
 * }
 * ```
 *
 * @throws {Error} Si el destinatario está vacío
 * @throws {Error} Si la plantilla no existe
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
      '../../templates/emails',
      `${templateName}.html`
    )

    // Leer la plantilla
    const templateSource = fs.readFileSync(templatePath, 'utf-8')

    // Compilar la plantilla con Handlebars
    const template = Handlebars.compile(templateSource)

    // Aplicar las variables a la plantilla
    const html = template(variables)

    // No enviar si el destinatario está vacío
    const recipient = (to || '').trim()
    if (!recipient) {
      throw new Error('Destinatario vacío: no se puede enviar el correo')
    }

    // Configurar opciones del correo con mejoras para evitar spam
    const mailOptions = transporterEmail(
      process.env.WELCOME_AND_FORGOT_PASSWORD_EMAIL || 'noreply@cellus.com.ec',
      recipient,
      subject,
      html
    )

    // Enviar el correo
    const info = await transporter().sendMail(mailOptions)
    console.log('Correo enviado:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error al enviar correo:', error)
    return { success: false, error }
  }
}

/**
 * Envía una boleta de pago al empleado
 *
 * Utiliza la plantilla 'boleta.html' para enviar los detalles de la boleta de pago.
 *
 * @async
 * @param {string} email - Correo del empleado
 * @param {string} fullName - Nombre completo del empleado
 * @param {string} month - Mes correspondiente a la boleta
 * @param {string} year - Año correspondiente a la boleta
 * @param {string} domain - URL del dominio para firmar la boleta
 * @returns {Promise<{success: boolean, messageId?: string, error?: any}>} Resultado del envío
 *
 * @example
 * ```typescript
 * await sendBoletaEmail(
 *   'juan@example.com',
 *   'Juan Pérez',
 *   'Diciembre',
 *   '2025',
 *   'https://cellus-cms.cellus.com.gt'
 * )
 * ```
 */
export const sendBoletaEmail = async (
  email: string,
  fullName: string,
  month: string,
  year: string,
  domain: string
) => {
  const variables = {
    fullName,
    month,
    year,
    domain
  }

  return sendTemplateEmail(
    email,
    'Boleta de Pago - CELLUS S.A',
    'boleta',
    variables
  )
}

/**
 * Envía el boleto de ornato al empleado
 *
 * Utiliza la plantilla 'boletoOrnato.html' para enviar el boleto de ornato anual.
 *
 * @async
 * @param {string} email - Correo del empleado
 * @param {string} fullName - Nombre completo del empleado
 * @param {string} year - Año del boleto de ornato
 * @returns {Promise<{success: boolean, messageId?: string, error?: any}>} Resultado del envío
 *
 * @example
 * ```typescript
 * await sendBoletoOrnatoEmail(
 *   'juan@example.com',
 *   'Juan Pérez',
 *   '2025'
 * )
 * ```
 */
export const sendBoletoOrnatoEmail = async (
  email: string,
  fullName: string,
  year: string
) => {
  const variables = {
    fullName,
    year
  }

  return sendTemplateEmail(
    email,
    'Boleto de Ornato - CELLUS S.A',
    'boletoOrnato',
    variables
  )
}

/**
 * Envía credenciales de acceso al CMS
 *
 * Utiliza la plantilla 'welcomeCMS.html' para enviar el usuario y contraseña temporal
 * a un nuevo administrador o usuario del CMS.
 *
 * @async
 * @param {string} email - Correo del usuario
 * @param {string} fullName - Nombre completo del usuario
 * @param {string} username - Nombre de usuario para iniciar sesión
 * @param {string} passwrd - Contraseña temporal
 * @param {string} domain - URL de acceso al sistema
 * @returns {Promise<{success: boolean, messageId?: string, error?: any}>} Resultado del envío
 *
 * @example
 * ```typescript
 * await sendWelcomeCMSEmail(
 *   'admin@cellus.com.gt',
 *   'Admin Sistema',
 *   'admin',
 *   'Temp123',
 *   'https://cellus-cms.cellus.com.gt'
 * )
 * ```
 */
export const sendWelcomeCMSEmail = async (
  email: string,
  fullName: string,
  username: string,
  passwrd: string,
  domain: string
) => {
  const variables = {
    fullName,
    username,
    password: passwrd,
    domain,
    year: new Date().getFullYear()
  }

  return sendTemplateEmail(
    email,
    'Bienvenido/a a CELLUS S.A',
    'welcomeCMS',
    variables
  )
}

/**
 * Envía un correo de bienvenida general a un nuevo usuario
 *
 * Utiliza la plantilla 'welcome.html' para dar la bienvenida a la plataforma.
 *
 * @async
 * @param {string} email - Correo del nuevo usuario
 * @param {string} fullName - Nombre completo del usuario
 * @param {string} loginUrl - URL para iniciar sesión
 * @returns {Promise<{success: boolean, messageId?: string, error?: any}>} Resultado del envío
 *
 * @example
 * ```typescript
 * await sendWelcomeEmail(
 *   'nuevo@example.com',
 *   'Nuevo Usuario',
 *   'https://cellus.com.gt/login'
 * )
 * ```
 */
export const sendWelcomeEmail = async (
  username: string,
  email: string,
  fullName: string,
  passwrd: string,
  domain: string
) => {
  const variables = {
    username,
    password: passwrd,
    fullName,
    domain,
    company: 'Cellus',
    companyName: 'CELLUS S.A',
    year: new Date().getFullYear()
  }

  return sendTemplateEmail(email, 'Bienvenido a Cellus', 'welcome', variables)
}

/**
 * Envía un correo de restablecimiento de contraseña
 *
 * Utiliza la plantilla 'resetPassword.html' para enviar una contraseña temporal
 * o instrucciones de restablecimiento.
 *
 * @async
 * @param {string} email - Correo del usuario
 * @param {string} fullName - Nombre completo del usuario
 * @param {string} passwrd - Nueva contraseña temporal
 * @param {string} domain - Dominio o enlace para acceder
 * @returns {Promise<{success: boolean, messageId?: string, error?: any}>} Resultado del envío
 *
 * @example
 * ```typescript
 * await sendResetPasswordEmail(
 *   'usuario@example.com',
 *   'Juan Pérez',
 *   'NewPass123',
 *   'https://cellus-cms.cellus.com.gt'
 * )
 * ```
 */
export const sendResetPasswordEmail = async (
  email: string,
  fullName: string,
  password: string, // Temporary password
  domain: string
) => {
  const variables = {
    fullName,
    password,
    domain,
    year: new Date().getFullYear()
  }

  return sendTemplateEmail(
    email,
    'Restablecimiento de contraseña',
    'resetPassword',
    variables
  )
}

/**
 * Envía inquietudes o sugerencias (Placeholder)
 *
 * Esta función está reservada para enviar feedback al equipo de desarrollo.
 * Actualmente no está implementada y retorna un error.
 *
 * @async
 * @param {string} type - Tipo de mensaje ('Inquietud' o 'Sugerencia')
 * @param {string} message - Contenido del mensaje
 * @returns {Promise<{success: boolean, messageId?: string, error?: any}>} Resultado del envío
 */
export const sendFeedbackEmail = async (type: string, message: string) => {
  // Implementación pendiente o simular
  return { success: false, error: 'Not implemented' }
}
