import type { Request, Response } from 'express'
import {
  RESPONSE_CODE_SUCCESS,
  RESPONSE_MESSAGE_SUCCESS,
  RESPONSE_STATUS_SUCCESS
} from '~/constants/RESPONSE_MESSAGE'
import { db_getDataRelevant } from '~/database/dashboardDB'
import { catchAsync } from '~/utils/catchAsync'

class DashboardController {
  /**
   * Obtiene todos los pagos
   */
  getPayments = catchAsync(async (req: Request, res: Response) => {
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const dashboard = await db_getDataRelevant()
    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS

    response.data = dashboard

    res.status(200).json({ getPaymentsResponse: response })
  })
}

const dashboardController = new DashboardController()
export default dashboardController
