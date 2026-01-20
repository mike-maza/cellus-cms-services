import { executeStoredProcedure } from '~/database/connection'
import { PROCEDURES } from '../procedures'

export const getAllDevicesOf2FA = async (userId: string) => {
  try {
    return await executeStoredProcedure(PROCEDURES.GET_ALL_DEVICES_OF_2FA, { userId })
  } catch (error) {
    throw error
  }
}

export const createNewDevice2FA = async (data: any) => {
  try {
    return await executeStoredProcedure(PROCEDURES.CREATE_NEW_DEVICE_2FA, data)
  } catch (error) {
    throw error
  }
}

export const deleteDevice2FA = async (deviceId: string) => {
  try {
    return await executeStoredProcedure(PROCEDURES.DELETE_DEVICE_2FA, { deviceId })
  } catch (error) {
    throw error
  }
}
