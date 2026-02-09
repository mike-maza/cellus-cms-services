import { Request } from 'express'

export type SecurityEvent =
  | 'UNAUTHORIZED_ACCESS'
  | 'SUSPICIOUS_ACTIVITY'
  | 'TOKEN_MISMATCH'
  | 'FINGERPRINT_MISMATCH'
  | 'INVALID_TOKEN'

interface SecurityLogEntry {
  timestamp: string
  event: SecurityEvent
  userId?: string
  requestedResource?: string
  ip: string
  userAgent: string
  details: string
}

/**
 * Registrar eventos de seguridad
 */
const logSecurityEvent = (entry: SecurityLogEntry): void => {
  console.warn('🔒 SECURITY EVENT:', {
    ...entry,
    timestamp: new Date().toISOString()
  })
}

/**
 * Registrar intento de acceso no autorizado
 */
export const logUnauthorizedAccess = (
  req: Request,
  userId?: string,
  details?: string
): void => {
  logSecurityEvent({
    timestamp: new Date().toISOString(),
    event: 'UNAUTHORIZED_ACCESS',
    ...(userId && { userId }),
    requestedResource: `${req.method} ${req.path}`,
    ip: req.ip || req.socket.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
    details: details || 'Intento de acceso no autorizado'
  })
}

/**
 * Registrar actividad sospechosa
 */
export const logSuspiciousActivity = (
  req: Request,
  userId: string,
  requestedUserId: string,
  details?: string
): void => {
  logSecurityEvent({
    timestamp: new Date().toISOString(),
    event: 'SUSPICIOUS_ACTIVITY',
    userId,
    requestedResource: `Usuario ${userId} intentó acceder a datos de ${requestedUserId}`,
    ip: req.ip || req.socket.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
    details:
      details ||
      `Usuario autenticado intentó acceder a recursos de otro usuario`
  })
}

/**
 * Registrar cuando el fingerprint no coincide
 */
export const logFingerprintMismatch = (
  req: Request,
  userId?: string,
  details?: string
): void => {
  logSecurityEvent({
    timestamp: new Date().toISOString(),
    event: 'FINGERPRINT_MISMATCH',
    ...(userId && { userId }),
    requestedResource: `${req.method} ${req.path}`,
    ip: req.ip || req.socket.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
    details:
      details ||
      'Token usado desde un dispositivo/navegador diferente al original'
  })
}

/**
 * Registrar token inválido
 */
export const logInvalidToken = (req: Request, details?: string): void => {
  logSecurityEvent({
    timestamp: new Date().toISOString(),
    event: 'INVALID_TOKEN',
    requestedResource: `${req.method} ${req.path}`,
    ip: req.ip || req.socket.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
    details: details || 'Token inválido o expirado'
  })
}
