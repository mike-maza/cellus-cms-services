import { executeStoredProcedure } from '~/database/connection'
import { PROCEDURES } from '../procedures'

const usuarios = [
  {
    id: 'USR001',
    Username: 'Admin Global',
    FirstName: 'Admin',
    LastName: 'Global',
    Status: 'Activo',
    Rol: 'Administrador',
    Email: 'admin@empresa.com'
    // rol: "Administrador",
    // estado: "activo",
    // fechaCreacion: "2023-01-01",
  },
  {
    id: 'USR002',
    Username: 'Gerente de Ventas',
    FirstName: 'Gerente',
    LastName: 'Ventas',
    Status: 'Activo',
    Rol: 'Gerente',
    Email: 'ventas@empresa.com'
    // rol: "Gerente",
    // estado: "activo",
    // fechaCreacion: "2023-01-10",
  },
  {
    id: 'USR003',
    Username: 'Contador Principal',
    FirstName: 'Contador',
    LastName: 'Principal',
    Status: 'Inactivo',
    Rol: 'Contador',
    Email: 'contabilidad@empresa.com'
    // rol: "Contador",
    // estado: "inactivo",
    // fechaCreacion: "2023-02-15",
  },
  {
    id: 'USR004',
    Username: 'Recursos Humanos',
    FirstName: 'Recursos',
    LastName: 'Humanos',
    Status: 'Inactivo',
    Rol: 'RRHH',
    Email: 'rrhh@empresa.com'
    // rol: "RRHH",
    // estado: "activo",
    // fechaCreacion: "2023-03-01",
  },
  {
    id: 'USR005',
    Username: 'Usuario Pendiente',
    FirtsName: 'Usuario',
    LastName: 'Pendiente',
    Status: 'Activo',
    Rol: 'Usuario',
    Email: 'pendiente@empresa.com'
    // rol: "Empleado",
    // estado: "pendiente",
    // fechaCreacion: "2023-04-20",
  }
]

/**
 * Obtiene todos los usuarios
 * Usa caché de 5 minutos para reducir carga en el servidor
 */
export const getAllUsers = async (): Promise<any[]> => {
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

export const login = async (data: any) => {
  try {
    return await executeStoredProcedure(PROCEDURES.LOGIN, data)
  } catch (error) {
    throw error
  }
}

export const getStepsUser = async (data: any) => {
  try {
    return await executeStoredProcedure(PROCEDURES.GET_STEPS_USER, data)
  } catch (error) {
    throw error
  }
}

export const validateAuthorizationCode = async (data: any) => {
  try {
    return await executeStoredProcedure(
      PROCEDURES.VALIDATE_AUTHORIZATION_CODE,
      data
    )
  } catch (error) {
    throw error
  }
}

export const getPassword = async (data: any) => {
  try {
    return await executeStoredProcedure(PROCEDURES.GET_PASSWORD, data)
  } catch (error) {
    throw error
  }
}

export const changePassword = async (data: any) => {
  try {
    return await executeStoredProcedure(PROCEDURES.CHANGES_PASSWORD, data)
  } catch (error) {
    throw error
  }
}

export const getUserById = async (id: string) => {
  try {
    return await executeStoredProcedure(PROCEDURES.GET_USER_BY_ID, { id })
  } catch (error) {
    throw error
  }
}

export const createUser = async (data: any) => {
  try {
    return await executeStoredProcedure(PROCEDURES.CREATE_USER, data)
  } catch (error) {
    throw error
  }
}

export const updateUser = async (data: any) => {
  try {
    return await executeStoredProcedure(PROCEDURES.UPDATE_USER, data)
  } catch (error) {
    throw error
  }
}

export const getProfile = async (id: string) => {
  try {
    return await executeStoredProcedure(PROCEDURES.GET_PROFILE, { id })
  } catch (error) {
    throw error
  }
}

export const updateProfile = async (data: any) => {
  try {
    return await executeStoredProcedure(PROCEDURES.UPDATED_PROFILE, data)
  } catch (error) {
    throw error
  }
}

export const logout = async (data: any) => {
  try {
    return await executeStoredProcedure(PROCEDURES.LOGOUT, data)
  } catch (error) {
    throw error
  }
}
