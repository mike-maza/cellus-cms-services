import type { Request, Response } from 'express'
import {
  RESPONSE_CODE_FAIL,
  RESPONSE_CODE_SUCCESS,
  RESPONSE_MESSAGE_FAIL,
  RESPONSE_MESSAGE_SUCCESS,
  RESPONSE_STATUS_FAIL,
  RESPONSE_STATUS_SUCCESS
} from '~/constants/RESPONSE_MESSAGE'
import {
  db_getAdvances,
  db_createAdvance,
  db_updateAdvance
} from '~/database/advanceDB'
import { catchAsync } from '~/utils/catchAsync'

class AdvanceController {
  /**
   * Obtiene todos los anticipos
   */
  /**
   * Obtiene todos los anticipos
   */
  public getAdvances = catchAsync(async (req: Request, res: Response) => {
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const advances = await db_getAdvances()
    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    // @ts-ignore
    response.data = advances

    res.send({ getAdvancesResponse: response })
  })

  /**
   * Crea un nuevo anticipo
   */
  public createAdvance = catchAsync(async (req: Request, res: Response) => {
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const result = await db_createAdvance(req.body)
    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    // @ts-ignore
    response.data = result

    res.send({ createAdvanceResponse: response })
  })

  /**
   * Actualiza un anticipo
   */
  public updateAdvance = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const result = await db_updateAdvance(id as string, req.body)
    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    // @ts-ignore
    response.data = result

    res.send({ updateAdvanceResponse: response })
  })
}

const advanceController = new AdvanceController()
export default advanceController
