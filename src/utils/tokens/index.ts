import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { Request } from 'express'

/**
 * Generar fingerprint único del usuario basado en User-Agent
 * Este fingerprint ayuda a prevenir el uso del token desde dispositivos diferentes
 * @param req Request object
 * @returns string Hash único del dispositivo
 */
export const generateUserFingerprint = (req: Request): string => {
  const userAgent = req.headers['user-agent'] || 'unknown'

  // Crear un hash del User-Agent para no almacenar información sensible directamente
  const fingerprint = crypto
    .createHash('sha256')
    .update(userAgent)
    .digest('hex')

  return fingerprint
}

/**
 * Con esta funcion verificamos si el token es valido
 * @param token string
 * */
export const verifyToken = (token: string) => {
  return jwt.verify(token, `${process.env.JWT_SECRET}`)
}

/**
 * Verificar token y validar fingerprint
 * @param token string
 * @param currentFingerprint string Fingerprint del request actual
 * @returns Payload del token si es válido
 * @throws Error si el token es inválido o el fingerprint no coincide
 */
export const verifyTokenWithFingerprint = (
  token: string,
  currentFingerprint: string
) => {
  const payload = jwt.verify(token, `${process.env.JWT_SECRET}`) as any

  // Validar que el fingerprint coincida
  if (payload.fingerprint && payload.fingerprint !== currentFingerprint) {
    throw new Error('FINGERPRINT_MISMATCH')
  }

  return payload
}

/**
 * Funcion que nos permite genera el accessToken y el RefreshToken
 * @param user object
 * @param fingerprint string Fingerprint único del dispositivo
 * @param JWT_SECRET string (opcional)
 * @param JWT_TEMP_EXP string (opcional)
 * */
export const accessTokenAndRefreshToken = (
  user: any,
  fingerprint: string,
  JWT_SECRET?: string,
  JWT_TEMP_EXP?: string
) => {
  const data = {
    accessToken: '',
    refreshToken: ''
  }

  // Payload con información del usuario y fingerprint
  const payload = {
    user,
    fingerprint
  }

  // Generamos el accessToken
  // @ts-ignore
  data.accessToken = jwt.sign(
    payload,
    JWT_SECRET || `${process.env.JWT_SECRET}`,
    {
      expiresIn: JWT_TEMP_EXP || process.env.JWT_TIEMPO_EXPIRA || '30min'
    }
  )

  // Generamos el refreshToken
  // @ts-ignore
  data.refreshToken = jwt.sign(
    payload,
    JWT_SECRET || `${process.env.JWT_REFRESH_TOKEN}`,
    {
      expiresIn: JWT_TEMP_EXP || process.env.JWT_REFRESH_TIEMPO_EXPIRA || '1h'
    }
  )

  return data
}
