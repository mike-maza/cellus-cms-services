import { Request, Response, NextFunction } from 'express'
import {
  RESPONSE_CODE_FAIL,
  RESPONSE_STATUS_FAIL
} from '~/constants/RESPONSE_MESSAGE'

import {
  verifyTokenWithFingerprint,
  generateUserFingerprint
} from '~/utils/tokens'
import { db_getRoleByUsername } from '~/database/rolesDB'
import {
  logUnauthorizedAccess,
  logSuspiciousActivity,
  logFingerprintMismatch,
  logInvalidToken
} from '~/utils/securityLogger'

/**
 * Con esta funcion verificamos si el token es válido y seguro
 * Incluye validación de fingerprint y validación estricta de usuario
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let { authorization: token } = req.headers
  token = token?.replace('Bearer', '').trim()

  const OAuthAccessToken = {
    responseCode: '',
    message: '',
    status: ''
  }

  // Validar que el token existe
  if (!token) {
    logUnauthorizedAccess(req, undefined, 'Token no proporcionado')

    OAuthAccessToken.responseCode = RESPONSE_CODE_FAIL
    OAuthAccessToken.status = RESPONSE_STATUS_FAIL
    OAuthAccessToken.message = 'Token no válido, autorización denegada'

    res.status(401).send({ OAuthAccessToken })
    return
  }

  try {
    // Generar fingerprint del request actual
    const currentFingerprint = generateUserFingerprint(req)

    // Verificar token y validar fingerprint
    const payload = verifyTokenWithFingerprint(token, currentFingerprint) as any
    const user = (payload as any)?.user ?? payload

    // Extraer información del usuario
    const currentUserCode = String(user?.username ?? '')
      .trim()
      .toLowerCase()

    if (!currentUserCode) {
      logUnauthorizedAccess(req, undefined, 'Token sin información de usuario')

      OAuthAccessToken.responseCode = RESPONSE_CODE_FAIL
      OAuthAccessToken.status = RESPONSE_STATUS_FAIL
      OAuthAccessToken.message = 'Token inválido'

      res.status(401).send({ OAuthAccessToken })
      return
    }

    // Adjuntar usuario al request
    ;(req as any).user = user

    // VALIDACIÓN ESTRICTA: Verificar que el usuario solo acceda a sus propios datos
    const requestedRaw =
      (req as any).params?.username ??
      (req as any).body?.username ??
      (req as any).query?.username

    if (requestedRaw) {
      const requestedUserCode = String(requestedRaw).trim().toLowerCase()

      // Obtener rol desde la base de datos ya que el token no siempre lo tiene actualizado o presente
      const roleResult = await db_getRoleByUsername(currentUserCode)
      // Ajustar según estructura respuesta: puede ser un array o objeto directo
      // Si es un array: roleResult[0]
      const roleData = Array.isArray(roleResult) ? roleResult[0] : roleResult

      const userRole = String(
        roleData?.RoleName ||
          roleData?.RoleName ||
          user?.Role ||
          user?.role ||
          ''
      ).toLowerCase()

      const isAdmin =
        userRole.includes('administrador') || userRole.includes('administrator')

      if (requestedUserCode !== currentUserCode && !isAdmin) {
        // Registrar actividad sospechosa
        logSuspiciousActivity(
          req,
          currentUserCode,
          requestedUserCode,
          `Usuario ${currentUserCode} intentó acceder a recursos de ${requestedUserCode}`
        )

        OAuthAccessToken.responseCode = RESPONSE_CODE_FAIL
        OAuthAccessToken.status = RESPONSE_STATUS_FAIL
        OAuthAccessToken.message = 'Acceso denegado'

        res.status(403).send({ OAuthAccessToken })
        return
      }
    }

    next()
  } catch (err: any) {
    console.error('Error en authMiddleware:', err)

    // Manejar error específico de fingerprint
    if (err.message === 'FINGERPRINT_MISMATCH') {
      logFingerprintMismatch(
        req,
        undefined,
        'Token usado desde un dispositivo diferente'
      )

      OAuthAccessToken.responseCode = RESPONSE_CODE_FAIL
      OAuthAccessToken.status = RESPONSE_STATUS_FAIL
      OAuthAccessToken.message = 'Token no válido para este dispositivo'

      res.status(403).send({ OAuthAccessToken })
      return
    }

    // Error genérico de token inválido
    logInvalidToken(req, err.message || 'Token inválido o expirado')

    OAuthAccessToken.responseCode = RESPONSE_CODE_FAIL
    OAuthAccessToken.status = RESPONSE_STATUS_FAIL
    OAuthAccessToken.message = 'Token no válido'

    res.status(401).send({ OAuthAccessToken })
  }
}
