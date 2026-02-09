import {
  executeStoredProcedure,
  invalidateCachePattern
} from '~/database/connection'
import { PROCEDURES } from '../procedures'

/**
 * Obtiene todos los usuarios
 * Usa caché de 5 minutos para reducir carga en el servidor
 */
export const db_getAllUsers = async (): Promise<any[]> => {
  try {
    const users = await executeStoredProcedure<any[]>(PROCEDURES.GET_USERS, {
      useCache: true,
      cacheTTL: 5 * 60 * 1000 // 5 minutos de caché
    })

    return users
  } catch (err) {
    console.error(err)
    throw err
  }
}

export const db_getPassword = async (data: any) => {
  try {
    return await executeStoredProcedure(PROCEDURES.GET_PASSWORD, {
      params: data
    })
  } catch (error) {
    throw error
  }
}

export const db_login = async (data: any) => {
  try {
    return await executeStoredProcedure(PROCEDURES.LOGIN, { params: data })
  } catch (error) {
    throw error
  }
}

export const db_getStepsUser = async (data: any) => {
  try {
    return await executeStoredProcedure(PROCEDURES.GET_STEPS_USER, {
      params: data
    })
  } catch (error) {
    throw error
  }
}

export const db_validateAuthorizationCode = async (data: any) => {
  try {
    return await executeStoredProcedure(
      PROCEDURES.VALIDATE_AUTHORIZATION_CODE,
      { params: data }
    )
  } catch (error) {
    throw error
  }
}

export const db_changePassword = async (data: any) => {
  try {
    return await executeStoredProcedure(PROCEDURES.CHANGES_PASSWORD, {
      params: data
    })
  } catch (error) {
    throw error
  }
}

export const db_createUser = async (data: any) => {
  try {
    const result = await executeStoredProcedure(PROCEDURES.CREATE_USER, {
      params: data
    })
    invalidateCachePattern(PROCEDURES.GET_USERS)

    return result
  } catch (error) {
    throw error
  }
}

export const db_updateUser = async (data: any) => {
  try {
    const result = await executeStoredProcedure(PROCEDURES.UPDATE_USER, {
      params: data
    })

    invalidateCachePattern(PROCEDURES.GET_USERS)
    return result
  } catch (error) {
    throw error
  }
}

export const db_getProfile = async (username: string) => {
  try {
    return await executeStoredProcedure(PROCEDURES.GET_PROFILE, {
      params: { username }
    })
  } catch (error) {
    throw error
  }
}

export const db_updateProfile = async (data: any) => {
  try {
    return await executeStoredProcedure(PROCEDURES.UPDATED_PROFILE, data)
  } catch (error) {
    throw error
  }
}

export const db_createSession = async (sessionData: {
  username: string
  deviceName: string
  deviceType: string
  browserName: string
  browserVersion: string
  os: string
  userAgent: string
  ipAddress: string
  country?: string
  countryCode?: string
  region?: string
  city?: string
  sessionToken?: string
}) => {
  const result = await executeStoredProcedure(PROCEDURES.CREATE_SESSION, {
    params: sessionData
  })

  return {
    message: result.recordset[0]?.Mensaje,
    sessionToken: result.output.sessionToken
  }
}

export const db_getActiveSessions = async (username: string) => {
  const result = await executeStoredProcedure(PROCEDURES.GET_ACTIVE_SESSIONS, {
    params: { username }
  })

  return result.recordset.map((device: any) => ({
    ...device,
    Location: `${device.City}, ${device.Country}`
  }))
}

export const db_closeSession = async (sessionToken: string) => {
  const result = await executeStoredProcedure(PROCEDURES.CLOSE_SESSION, {
    params: { sessionToken }
  })

  return result.recordset[0]
}

export const db_closeAllSessions = async (codEmployee: string) => {
  const result = await executeStoredProcedure(PROCEDURES.CLOSE_ALL_SESSIONS, {
    params: { codEmployee }
  })

  return result.recordset[0]
}

export const db_logoutWithSession = async (
  codEmployee: string,
  sessionToken: string,
  deviceInfo: {
    deviceName: string
    browserName: string
  }
) => {
  // Primero verificar que la sesión existe y pertenece al usuario y dispositivo

  const sessionCheck = await executeStoredProcedure(
    PROCEDURES.GET_ACTIVE_SESSIONS,
    {
      params: { codEmployee }
    }
  )

  const sessions = sessionCheck.recordset

  // Buscar la sesión que coincida con el token y dispositivo
  const matchingSession = sessions.find(
    (session: any) =>
      session.SessionToken === sessionToken &&
      session.DeviceName === deviceInfo.deviceName &&
      session.BrowserName === deviceInfo.browserName
  )

  if (!matchingSession) {
    throw new Error(
      'Sesión no encontrada o no coincide con el dispositivo actual'
    )
  }

  // Si la sesión es válida, cerrarla
  const result = await executeStoredProcedure(PROCEDURES.CLOSE_SESSION, {
    params: { sessionToken }
  })

  return result.recordset[0]
}

export const db_closeDeviceSessions = async (
  codEmployee: string,
  deviceName: string,
  browserName: string
) => {
  const result = await executeStoredProcedure(
    PROCEDURES.CLOSE_DEVICE_SESSIONS,
    {
      params: { codEmployee, deviceName, browserName }
    }
  )

  return result.recordset[0]
}

export const db_updateSessionActivity = async (sessionToken: string) => {
  const result = await executeStoredProcedure(
    PROCEDURES.UPDATE_SESSION_ACTIVITY,
    {
      params: { sessionToken }
    }
  )

  return result.recordset[0]
}

export const db_getSessionHistory = async (codEmployee: string) => {
  const result = await executeStoredProcedure(PROCEDURES.GET_SESSION_HISTORY, {
    params: { codEmployee }
  })

  return result.recordset
}
