import { executeStoredProcedure } from '~/database/connection'
import { PROCEDURES } from '../procedures'

export const db_getStepsByUser = async (username: string) => {
  try {
    const step = await executeStoredProcedure(PROCEDURES.GET_STEP_BY_USERNAME, {
      params: { Username: username }
    })

    return step[0]
  } catch (error) {
    throw error
  }
}

export const db_resetUserStep = async (username: string, stepName: string) => {
  try {
    const step = await executeStoredProcedure(PROCEDURES.RESET_USER_STEP, {
      params: { Username: username, StepName: stepName }
    })

    return step[0]
  } catch (error) {
    throw error
  }
}

export const db_updateStep = async (data: {
  Username: string
  StepName: string
}) => {
  try {
    const result = await executeStoredProcedure(PROCEDURES.UPDATE_STEP, {
      params: data
    })

    return result
  } catch (error) {
    throw error
  }
}
