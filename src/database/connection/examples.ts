import {
  executeStoredProcedure,
  executeQuery,
  executeTransaction,
  invalidateCache,
  invalidateCachePattern,
  clearCache
} from '~/database/connection'

// ============================================================================
// EJEMPLOS DE USO
// ============================================================================

/**
 * Ejemplo 1: Ejecutar stored procedure SIN caché
 * Útil para datos que cambian frecuentemente
 */
export const getAllUsers = async (): Promise<Users[]> => {
  try {
    const users = await executeStoredProcedure<Users[]>('get_Users')
    return users
  } catch (err) {
    console.error(err)
    throw err
  }
}

/**
 * Ejemplo 2: Ejecutar stored procedure CON caché
 * Útil para datos que no cambian frecuentemente (catálogos, configuraciones, etc.)
 */
export const getCompanies = async (): Promise<Company[]> => {
  try {
    const companies = await executeStoredProcedure<Company[]>('get_Companies', {
      useCache: true,
      cacheTTL: 10 * 60 * 1000 // 10 minutos
    })
    return companies
  } catch (err) {
    console.error(err)
    throw err
  }
}

/**
 * Ejemplo 3: Ejecutar stored procedure con parámetros y caché
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const users = await executeStoredProcedure<User[]>('get_UserById', {
      useCache: true,
      cacheTTL: 5 * 60 * 1000, // 5 minutos
      params: {
        UserId: userId
      }
    })
    return users[0] || null
  } catch (err) {
    console.error(err)
    throw err
  }
}

/**
 * Ejemplo 4: Ejecutar query SQL directa
 */
export const getCustomData = async (): Promise<any[]> => {
  try {
    const query = `
      SELECT TOP 10 * 
      FROM Users 
      WHERE IsActive = 1 
      ORDER BY CreatedAt DESC
    `
    const data = await executeQuery(query)
    return data
  } catch (err) {
    console.error(err)
    throw err
  }
}

/**
 * Ejemplo 5: Ejecutar transacción
 */
export const createUserWithRole = async (
  userData: any,
  roleData: any
): Promise<{ userId: number; roleId: number }> => {
  try {
    const result = await executeTransaction(async transaction => {
      // Insertar usuario
      const userResult = await transaction
        .request()
        .input('Name', userData.name)
        .input('Email', userData.email)
        .execute('insert_User')

      const userId = userResult.recordset[0].UserId

      // Insertar rol
      const roleResult = await transaction
        .request()
        .input('UserId', userId)
        .input('RoleName', roleData.roleName)
        .execute('insert_UserRole')

      const roleId = roleResult.recordset[0].RoleId

      return { userId, roleId }
    })

    // Invalidar caché de usuarios después de crear uno nuevo
    invalidateCachePattern('get_User')

    return result
  } catch (err) {
    console.error(err)
    throw err
  }
}

/**
 * Ejemplo 6: Invalidar caché específico
 */
export const updateUser = async (
  userId: string,
  userData: any
): Promise<void> => {
  try {
    await executeStoredProcedure('update_User', {
      params: {
        UserId: userId,
        ...userData
      }
    })

    // Invalidar caché específico de este usuario
    invalidateCache('get_UserById', { UserId: userId })

    // Invalidar todos los cachés relacionados con usuarios
    invalidateCachePattern('get_User')
  } catch (err) {
    console.error(err)
    throw err
  }
}

/**
 * Ejemplo 7: Limpiar todo el caché
 * Útil cuando hay cambios masivos en la base de datos
 */
export const resetAllCache = (): void => {
  clearCache()
}

// ============================================================================
// TIPOS DE EJEMPLO
// ============================================================================

interface Users {
  UserId: string
  Name: string
  Email: string
  IsActive: boolean
  CreatedAt: Date
}

interface Company {
  CompanyId: string
  Name: string
  IsActive: boolean
}

interface User {
  UserId: string
  Name: string
  Email: string
}
