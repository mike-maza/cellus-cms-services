import {
  executeStoredProcedure,
  invalidateCachePattern
} from '~/database/connection'
import { PROCEDURES } from '../procedures'

export const db_getRoles = async () => {
  try {
    return await executeStoredProcedure(PROCEDURES.GET_ROLES)
  } catch (error) {
    throw error
  }
}

export const db_getRoleByUsername = async (username: string) => {
  try {
    return await executeStoredProcedure(PROCEDURES.GET_ROLE_BY_USERNAME, {
      params: { Username: username }
    })
  } catch (error) {
    throw error
  }
}

export const db_createRole = async (data: any) => {
  try {
    return await executeStoredProcedure(PROCEDURES.CREATE_ROLE, data)
  } catch (error) {
    throw error
  }
}

export const db_updateRole = async (data: any) => {
  try {
    return await executeStoredProcedure(PROCEDURES.UPDATE_ROLE, data)
  } catch (error) {
    throw error
  }
}
export const db_getRolesWithDetails = async () => {
  try {
    return await executeStoredProcedure(PROCEDURES.GET_ROLES_WITH_DETAILS)
  } catch (error) {
    throw error
  }
}

export const db_asignRole = async (
  username: string,
  roleId: string,
  assignedByUsername: string
) => {
  try {
    const result = await executeStoredProcedure(PROCEDURES.ASIGN_ROLE, {
      params: {
        Username: username,
        RoleID: roleId,
        AssignedByUsername: assignedByUsername
      }
    })
    invalidateCachePattern(PROCEDURES.GET_USERS)
    return result
  } catch (error) {
    throw error
  }
}

export const db_disactivateRole = async (username: string, roleId: string) => {
  try {
    const result = await executeStoredProcedure(PROCEDURES.DISACTIVATE_ROLE, {
      params: { Username: username, RoleID: roleId }
    })
    invalidateCachePattern(PROCEDURES.GET_USERS)
    return result
  } catch (error) {
    throw error
  }
}
