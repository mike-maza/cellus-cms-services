import { Request, Response } from 'express'
import { sendWelcomeEmail } from '../../utils/emailSender'

export class UserController {
  /**
   * Ejemplo de cómo enviar un correo de bienvenida al crear un usuario
   * @param req Request de Express
   * @param res Response de Express
   */
  static async createUser(req: Request, res: Response) {
    try {
      const { email, fullName, username, password } = req.body

      // Aquí iría la lógica para crear el usuario en la base de datos
      // ...

      // Enviar correo de bienvenida
      const emailResult = await sendWelcomeEmail(
        email,
        fullName,
        username,
        password
      )

      if (!emailResult.success) {
        console.error(
          'Error al enviar correo de bienvenida:',
          emailResult.error
        )
        // Continuar con la respuesta aunque el correo falle
      }

      return res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        emailSent: emailResult.success
      })
    } catch (error: any) {
      console.error('Error al crear usuario:', error)
      return res.status(500).json({
        success: false,
        message: 'Error al crear usuario',
        error: error.message
      })
    }
  }
}
