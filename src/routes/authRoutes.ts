import express, { Router } from 'express'
import { AuthController, authValidators } from '../controller/auth/authController'
import { authenticate } from '../middleware/authMiddleware'

const router: Router = express.Router()

// Ruta para registro de usuarios
router.post('/register', authValidators.register, AuthController.register)

// Ruta para inicio de sesión
router.post('/login', authValidators.login, AuthController.login)

// Ruta para cambio de contraseña (requiere autenticación)
router.post('/change-password', authenticate, authValidators.changePassword, AuthController.changePassword)

export default router