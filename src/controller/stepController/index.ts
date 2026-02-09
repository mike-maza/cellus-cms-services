import type { Request, Response } from 'express'
import {
  RESPONSE_CODE_FAIL,
  RESPONSE_CODE_SUCCESS,
  RESPONSE_MESSAGE_FAIL,
  RESPONSE_MESSAGE_SUCCESS,
  RESPONSE_STATUS_FAIL,
  RESPONSE_STATUS_SUCCESS
} from '~/constants/RESPONSE_MESSAGE'
import { db_getStepsByUser, db_resetUserStep } from '~/database/stepDB'
import { catchAsync } from '~/utils/catchAsync'

class StepController {
  /**
   * Obtiene un paso por ID
   */
  getStepsByUser = catchAsync(async (req: Request, res: Response) => {
    const { username } = req.params
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const step = await db_getStepsByUser(username as string)
    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    response.data = step

    res.send({ getStepsByUserResponse: response })
  })

  /**
   *
   */

  resetUserStep = catchAsync(async (req: Request, res: Response) => {
    const { username, stepName } = req.params
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const step = await db_resetUserStep(username as string, stepName as string)
    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    response.data = step

    res.send({ resetUserStepResponse: response })
  })

  deleteUserStep = catchAsync(async (req: Request, res: Response) => {
    const { username, stepName } = req.params
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const step = await db_resetUserStep(username as string, stepName as string)
    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    response.data = step

    res.send({ deleteUserStepResponse: response })
  })
}

const stepController = new StepController()
export default stepController
