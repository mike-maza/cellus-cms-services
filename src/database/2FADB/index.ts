import { executeStoredProcedure } from '~/database/connection'
import { PROCEDURES } from '~/database/procedures'

export const db_getAllDevicesOf2FA = async (username: string) => {
  try {
    return await executeStoredProcedure(PROCEDURES.GET_ALL_DEVICES_OF_2FA, {
      params: { Username: username }
    })
  } catch (error) {
    throw error
  }
}

export const db_getDevice2FAById = async (username: string, id: number) => {
  try {
    return await executeStoredProcedure(PROCEDURES.GET_DEVICE_2FA_BY_ID, {
      params: { Username: username, TwoFactorId: id }
    })
  } catch (error) {
    throw error
  }
}

export const db_createNewDevice2FA = async (data: any) => {
  try {
    return await executeStoredProcedure(PROCEDURES.CREATE_NEW_DEVICE_2FA, {
      params: data
    })
  } catch (error) {
    throw error
  }
}

export const db_updateDevice2FA = async (data: any) => {
  try {
    return await executeStoredProcedure(PROCEDURES.CREATE_NEW_DEVICE_2FA, {
      params: data
    })
  } catch (error) {
    throw error
  }
}

export const db_deleteDevice2FA = async (data: {
  Username: string
  DeviceId: string
}) => {
  try {
    return await executeStoredProcedure(PROCEDURES.DELETE_DEVICE_2FA, {
      params: data
    })
  } catch (error) {
    throw error
  }
}
