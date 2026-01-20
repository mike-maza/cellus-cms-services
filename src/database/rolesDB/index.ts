import { executeStoredProcedure } from '~/database/connection'
import { PROCEDURES } from '../procedures'

export const getRoles = async () => {
  try {
    return await executeStoredProcedure(PROCEDURES.GET_ROLES)
  } catch (error) {
    throw error
  }
}

export const createRole = async (data: any) => {
  try {
    return await executeStoredProcedure(PROCEDURES.CREATE_ROLE, data)
  } catch (error) {
    throw error
  }
}

export const updateRole = async (data: any) => {
  try {
    return await executeStoredProcedure(PROCEDURES.UPDATE_ROLE, data)
  } catch (error) {
    throw error
  }
}
export const getRolesWithDetails = async () => {
  try {
    return await executeStoredProcedure(PROCEDURES.GET_ROLES_WITH_DETAILS)
  } catch (error) {
    throw error
  }
}
