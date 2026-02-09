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
  db_insertOrUpdateBoleta,
  db_getBoletoOrnatoData
} from '~/database/boletasDB'
import { catchAsync } from '~/utils/catchAsync'

class BoletasController {
  /**
   * Inserta o actualiza una boleta
   */
  /**
   * Inserta o actualiza una boleta
   */
  public insertOrUpdateBoleta = catchAsync(
    async (req: Request, res: Response) => {
      const response = {
        responseCode: '',
        message: '',
        status: '',
        data: []
      }

      const result = await db_insertOrUpdateBoleta(req.body)
      response.responseCode = RESPONSE_CODE_SUCCESS
      response.message = RESPONSE_MESSAGE_SUCCESS
      response.status = RESPONSE_STATUS_SUCCESS
      // @ts-ignore
      response.data = result

      res.send({ insertOrUpdateBoletaResponse: response })
    }
  )

  /**
   * Obtiene datos del boleto de ornato
   */
  public getBoletoOrnatoData = catchAsync(
    async (req: Request, res: Response) => {
      const response = {
        responseCode: '',
        message: '',
        status: '',
        data: []
      }

      const data = await db_getBoletoOrnatoData()
      response.responseCode = RESPONSE_CODE_SUCCESS
      response.message = RESPONSE_MESSAGE_SUCCESS
      response.status = RESPONSE_STATUS_SUCCESS
      // @ts-ignore
      response.data = data

      res.send({ getBoletoOrnatoDataResponse: response })
    }
  )
}

const boletasController = new BoletasController()
export default boletasController
