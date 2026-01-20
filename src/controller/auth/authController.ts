import { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { AuthService } from '../../services/authService'
import { catchAsync } from '~/utils/catchAsync'

// Validadores para las rutas de autenticación
export const authValidators = {
  register: [
    body('firstName').notEmpty().withMessage('El nombre es requerido'),
    body('lastName').notEmpty().withMessage('El apellido es requerido'),
    body('email').isEmail().withMessage('Correo electrónico inválido'),
    body('username')
      .notEmpty()
      .withMessage('El nombre de usuario es requerido'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('role').notEmpty().withMessage('El rol es requerido'),
    body('companyId')
      .optional()
      .isNumeric()
      .withMessage('ID de compañía inválido')
  ],
  login: [
    body('email').isEmail().withMessage('Correo electrónico inválido'),
    body('password').notEmpty().withMessage('La contraseña es requerida')
  ],
  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('La contraseña actual es requerida'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
  ]
}

export class AuthController {
  // Método para registrar un nuevo usuario
  static register = catchAsync(async (req: Request, res: Response) => {
    // Validar los datos de entrada
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const {
      firstName,
      lastName,
      email,
      username,
      password,
      role,
      companyId,
      isHR
    } = req.body

    // Registrar el usuario
    const result = await AuthService.register({
      firstName,
      lastName,
      email,
      username,
      password,
      role,
      companyId,
      isHR
    })

    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      data: result
    })
  })

  // Método para iniciar sesión
  static login = catchAsync(async (req: Request, res: Response) => {
    // Validar los datos de entrada
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    // Iniciar sesión
    const result = await AuthService.login(email, password)

    return res.status(200).json({
      message: 'Inicio de sesión exitoso',
      data: result
    })
  })

  // Método para cambiar la contraseña
  static changePassword = catchAsync(async (req: Request, res: Response) => {
    // Validar los datos de entrada
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { currentPassword, newPassword } = req.body
    // @ts-ignore
    const userId = (req as any).user?.id

    if (!userId) {
      return res.status(401).json({
        message: 'No autorizado'
      })
    }

    // Cambiar la contraseña
    await AuthService.changePassword(
      Number(userId),
      currentPassword,
      newPassword
    )

    return res.status(200).json({
      message: 'Contraseña actualizada exitosamente'
    })
  })
}
