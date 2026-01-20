import { executeStoredProcedure } from '~/database/connection'
import { PROCEDURES } from '../procedures'

export const getSteps = async () => {
  try {
    return await executeStoredProcedure(PROCEDURES.GET_STEPS)
  } catch (error) {
    throw error
  }
}

export const getStepById = async (id: string) => {
  try {
    return await executeStoredProcedure(PROCEDURES.GET_STEP_BY_ID, { id })
  } catch (error) {
    throw error
  }
}

export const createStep = async (data: any) => {
  try {
    return await executeStoredProcedure(PROCEDURES.CREATE_STEP, data)
  } catch (error) {
    throw error
  }
}

export const updateStep = async (data: any) => {
  try {
    return await executeStoredProcedure(PROCEDURES.UPDATE_STEP, data)
  } catch (error) {
    throw error
  }
}
