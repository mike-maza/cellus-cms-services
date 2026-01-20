import { executeStoredProcedure } from '~/database/connection'
import { PROCEDURES } from '../procedures'

export const getPermissions = async () => {
  try {
    return await executeStoredProcedure(PROCEDURES.GET_PERMISSIONS)
  } catch (error) {
    throw error
  }
}
export const getPermissionsByRole = async (RoleId: number) => {
  try {
    return await executeStoredProcedure(PROCEDURES.GET_PERMISSIONS_BY_ROLE, {
      params: { RoleId }
    })
  } catch (error) {
    throw error
  }
}
