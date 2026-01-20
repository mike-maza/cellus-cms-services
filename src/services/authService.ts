import * as argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import { User, UserModel } from '../models/User'

// Interfaz para el registro de usuario
interface RegisterUserData {
  firstName: string
  lastName: string
  email: string
  username: string
  password: string
  role: string
  companyId?: number
  isHR?: boolean
}

// Interfaz para el payload del token JWT
interface TokenPayload {
  id: number
  email: string
  role: string
  isHR: boolean
}

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
  private static readonly JWT_EXPIRES_IN = '24h'

  // Método para generar un token JWT
  private static generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN })
  }

  // Método para verificar un token JWT
  static verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.JWT_SECRET) as TokenPayload
    } catch (error) {
      return null
    }
  }

  // Método para registrar un nuevo usuario
  static async register(userData: RegisterUserData) {
    // Verificar si el correo electrónico ya está en uso
    const existingUser = await UserModel.findByEmail(userData.email)
    if (existingUser) {
      throw new Error('El correo electrónico ya está en uso')
    }

    // Generar hash de la contraseña
    const passwordHash = await argon2.hash(userData.password)

    // Crear el usuario
    const newUser = await UserModel.create({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      username: userData.username,
      password: userData.password, // Guardar la contraseña original (no recomendado en producción)
      passwordHash, // Guardar el hash de la contraseña
      role: userData.role,
      companyId: userData.companyId || null,
      isHR: userData.isHR || false,
      enabledUser: true,
      twoFactorEnabled: false
    })

    if (!newUser) {
      throw new Error('Error al crear el usuario')
    }

    // Generar token JWT
    const token = this.generateToken({
      id: newUser.userId,
      email: newUser.email,
      role: newUser.role,
      isHR: newUser.isHR || false
    })

    return {
      token,
      user: {
        id: newUser.userId,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
        isHR: newUser.isHR
      }
    }
  }

  // Método para iniciar sesión
  static async login(email: string, password: string) {
    // Buscar el usuario por correo electrónico
    const user = await UserModel.findByEmail(email)
    if (!user) {
      throw new Error('Credenciales inválidas')
    }

    // Verificar si el usuario está habilitado
    if (!user.enabledUser) {
      throw new Error('Usuario deshabilitado')
    }

    // Verificar la contraseña
    const isPasswordValid = await argon2.verify(user.passwordHash, password)
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas')
    }

    // Generar token JWT
    const token = this.generateToken({
      id: user.userId,
      email: user.email,
      role: user.role,
      isHR: user.isHR || false
    })

    return {
      token,
      user: {
        id: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        role: user.role,
        isHR: user.isHR
      }
    }
  }

  // Método para cambiar la contraseña
  static async changePassword(userId: number, currentPassword: string, newPassword: string) {
    // Buscar el usuario por ID
    const user = await UserModel.findById(userId)
    if (!user) {
      throw new Error('Usuario no encontrado')
    }

    // Verificar la contraseña actual
    const isPasswordValid = await argon2.verify(user.passwordHash, currentPassword)
    if (!isPasswordValid) {
      throw new Error('Contraseña actual incorrecta')
    }

    // Generar hash de la nueva contraseña
    const newPasswordHash = await argon2.hash(newPassword)

    // Actualizar la contraseña
    const updated = await UserModel.update(userId, {
      password: newPassword, // Guardar la contraseña original (no recomendado en producción)
      passwordHash: newPasswordHash // Guardar el hash de la nueva contraseña
    })

    if (!updated) {
      throw new Error('Error al actualizar la contraseña')
    }

    return true
  }
}