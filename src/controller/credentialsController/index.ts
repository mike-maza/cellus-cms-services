import type { Request, Response } from 'express'
import jwt from 'jsonwebtoken'

import {
  db_getPassword,
  db_changePassword,
  db_login,
  db_createSession,
  db_getProfile,
  db_updateProfile,
  db_getActiveSessions,
  db_closeSession,
  db_closeAllSessions,
  db_logoutWithSession,
  db_closeDeviceSessions,
  db_updateSessionActivity,
  db_getSessionHistory
} from '~/database/usersDB'

import { catchAsync } from '~/utils/catchAsync'
import { AppError } from '~/utils/AppError'
import {
  accessTokenAndRefreshToken,
  generateUserFingerprint
} from '~/utils/tokens'
import { comparePassword, encryptPassword } from '~/utils/encriptPassword'
import { sendNewLoginDetectedEmail } from '~/utils/emailSender'

import { getIPGeolocation } from '~/services'
import {
  RESPONSE_CODE_SUCCESS,
  RESPONSE_MESSAGE_SUCCESS,
  RESPONSE_STATUS_SUCCESS
} from '~/constants/RESPONSE_MESSAGE'
import { db_updateStep } from '~/database/stepDB'

class CredentialsController {
  /**
   * Obtiene las credenciales (password) de un usuario
   */
  getCredentials = catchAsync(async (req: Request, res: Response) => {
    const { username, password, deviceInfo, ipAddress } = req.body

    if (!username || !password) {
      throw new AppError('usuario y contraseña son requeridos', 400)
    }

    const credentials = await db_login({ username })
    console.log(credentials)

    if (!credentials) {
      throw new AppError('No se encontraron credenciales', 404)
    }

    if (!credentials[0].Status) {
      throw new AppError('No tienes permisos para acceder', 403)
    }

    const comparedPassword = await comparePassword(
      credentials[0].Password,
      password
    )

    if (comparedPassword || credentials[0].Password === password) {
      const fingerprint = generateUserFingerprint(req)
      const { accessToken, refreshToken } = accessTokenAndRefreshToken(
        {
          username
        },
        fingerprint
      )

      // Crear sesión con información del dispositivo
      if (deviceInfo) {
        try {
          // Obtener IP real del cliente
          // const ipAddress = await getClientIp(req)

          // Obtener ubicación por IP
          const geolocation = await getIPGeolocation(ipAddress)

          const sessionResult = await db_createSession({
            username,
            deviceName:
              `${deviceInfo.device?.brand || deviceInfo.device?.type || 'Unknown'} ${deviceInfo.device?.model || ''}`.trim(),
            deviceType: deviceInfo.device?.type || 'desktop',
            browserName: deviceInfo.client?.name || 'Unknown',
            browserVersion: deviceInfo.client?.version || 'Unknown',
            os: `${deviceInfo.os?.name || 'Unknown'} ${deviceInfo.os?.version || ''}`.trim(),
            userAgent: req.headers['user-agent'] || 'Unknown',
            ipAddress: ipAddress,
            country: geolocation.country,
            countryCode: geolocation.countryCode,
            region: geolocation.region,
            city: geolocation.city
          })

          // Enviar correo de nuevo inicio de sesión
          await sendNewLoginDetectedEmail(
            credentials[0].Email,
            credentials[0].FullName,
            {
              location: geolocation.formatted,
              time: new Date().toLocaleString('es-GT', {
                timeZone: 'America/Guatemala',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }),
              browser:
                `${deviceInfo.client?.name || 'Unknown'} ${deviceInfo.client?.version || ''}`.trim(),
              device:
                `${deviceInfo.device?.brand || deviceInfo.device?.type || 'Unknown'} ${deviceInfo.device?.model || ''}`.trim(),
              ip: ipAddress
            }
          )

          res.status(200).json({
            accessToken,
            refreshToken,
            fullName: credentials[0].FullName,
            codEmployee: credentials[0].CodEmployee,
            sessionToken: sessionResult.sessionToken
          })
          return
        } catch (error) {
          console.error('Error al crear sesión o enviar email:', error)
          // No lanzamos error para no bloquear el login
        }
      }

      res.status(200).json({
        accessToken,
        refreshToken,
        username,
        fullName: `${credentials[0].FirstName} ${credentials[0].LastName}`,
        codEmployee: credentials[0].CodEmployee
      })
      return
    }

    throw new AppError('Contraseña incorrecta', 401)
  })

  /**
   * Refresca el token de autenticación (Boilerplate)
   */
  refreshToken = catchAsync(async (req: Request, res: Response) => {
    const { refreshToken } = req.body

    if (!refreshToken) {
      throw new AppError('Refresh token es requerido', 400)
    }

    try {
      // Verificar el token usando el secreto de refresh token
      // Nota: Usamos jwt.verify directamente porque verifyToken usa el secreto de access token
      const payload = jwt.verify(
        refreshToken,
        `${process.env.JWT_REFRESH_TOKEN}`
      ) as any

      // Generar fingerprint actual
      const currentFingerprint = generateUserFingerprint(req)

      // Validar fingerprint si existe en el payload
      if (payload.fingerprint && payload.fingerprint !== currentFingerprint) {
        throw new AppError('Sesión inválida para este dispositivo', 403)
      }

      // Generar nuevos tokens
      const tokens = accessTokenAndRefreshToken(
        payload.user,
        currentFingerprint
      )

      res.status(200).json(tokens)
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new AppError('Refresh token inválido o expirado', 403)
    }
  })

  /**
   * Realiza el cambio de contraseña
   */
  changesPassword = catchAsync(async (req: Request, res: Response) => {
    const { username } = (req as any).user
    const { currentPassword, newPassword, isNewPassword } = req.body

    if (!username) {
      throw new AppError('username es requerido', 400)
    }

    if (!newPassword) {
      throw new AppError('contraseña es requerida', 400)
    }

    if (currentPassword) {
      const comparedPassword = await db_getPassword(username)
      const compared = await comparePassword(
        comparedPassword.Password,
        currentPassword
      )

      if (!compared) {
        throw new AppError('Contraseña incorrecta', 401)
      }
    }

    if (isNewPassword) {
      await db_updateStep({
        Username: username,
        StepName: 'reset-password'
      })
    }

    const encriptPassword = await encryptPassword(newPassword)

    if (!encriptPassword) {
      console.log(`encriptPassword: ${encriptPassword}`)
      throw new AppError('Error al encriptar la contraseña', 400)
    }

    const result = await db_changePassword({
      Username: username,
      NewPassword: encriptPassword
    })

    if (!result) {
      throw new AppError('No se puede actualizar la contraseña', 404)
    }

    console.log(`result: ${result}`)

    res.status(200).json(result)
  })

  /**
   * Obtiene el perfil de usuario
   */
  getProfile = catchAsync(async (req: Request, res: Response) => {
    const { username } = req.params
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const profile = await db_getProfile(username as string)
    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    // @ts-ignore
    response.data = profile

    res.send({ getProfileResponse: response })
  })

  /**
   * Actualiza el perfil de usuario
   */
  updateProfile = catchAsync(async (req: Request, res: Response) => {
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const result = await db_updateProfile(req.body)
    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    // @ts-ignore
    response.data = result

    res.send({ updateProfileResponse: response })
  })

  getActiveSessions = catchAsync(async (req: Request, res: Response) => {
    const { username } = req.params

    if (!username) {
      throw new AppError('username es requerido', 400)
    }

    const sessions = await db_getActiveSessions(username as string)

    res.status(200).json(sessions)
  })

  closeSession = catchAsync(async (req: Request, res: Response) => {
    const { sessionToken } = req.body

    if (!sessionToken) {
      throw new AppError('sessionToken es requerido', 400)
    }

    const result = await db_closeSession(sessionToken as string)

    res.status(200).json(result)
  })

  closeAllSessions = catchAsync(async (req: Request, res: Response) => {
    const { username } = req.params

    if (!username) {
      throw new AppError('username es requerido', 400)
    }

    const result = await db_closeAllSessions(username as string)

    res.status(200).json(result)
  })

  closeDeviceSessions = catchAsync(async (req: Request, res: Response) => {
    const { username } = req.params
    const { deviceName, browserName } = req.body

    if (!username) {
      throw new AppError('username es requerido', 400)
    }

    if (!deviceName || !browserName) {
      throw new AppError('deviceName y browserName son requeridos', 400)
    }

    const result = await db_closeDeviceSessions(
      username as string,
      deviceName as string,
      browserName as string
    )

    res.status(200).json(result)
  })

  updateSessionActivity = catchAsync(async (req: Request, res: Response) => {
    const { sessionToken } = req.body

    if (!sessionToken) {
      throw new AppError('sessionToken es requerido', 400)
    }

    const result = await db_updateSessionActivity(sessionToken as string)

    res.status(200).json(result)
  })

  getSessionHistory = catchAsync(async (req: Request, res: Response) => {
    const { username } = req.params

    if (!username) {
      throw new AppError('username es requerido', 400)
    }

    const history = await db_getSessionHistory(username as string)

    res.status(200).json(history)
  })

  /**
   * Cierre de sesión
   */
  logout = catchAsync(async (req: Request, res: Response) => {
    const { username, sessionToken, deviceInfo } = req.body

    if (!username) {
      throw new AppError('username es requerido', 400)
    }

    if (!sessionToken) {
      throw new AppError('sessionToken es requerido', 400)
    }

    if (!deviceInfo || !deviceInfo.deviceName || !deviceInfo.browserName) {
      throw new AppError('Información del dispositivo es requerida', 400)
    }

    const result = await db_logoutWithSession(username, sessionToken, {
      deviceName:
        `${deviceInfo.device?.brand || deviceInfo.device?.type || 'Unknown'} ${deviceInfo.device?.model || ''}`.trim(),
      browserName: deviceInfo.client?.name || 'Unknown'
    })

    res.status(200).json(result)
  })
}

const credentialsController = new CredentialsController()
export default credentialsController
