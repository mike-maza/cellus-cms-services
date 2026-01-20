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
  getPayments,
  getPaymentByUiAuthorizationDB
} from '~/database/paymentDB'
import { catchAsync } from '~/utils/catchAsync'

class PaymentController {
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

    const { yearMonths, page, pageSize } = req.query

    const payments = await getPayments({
      YearMonths: yearMonths as string | undefined,
      PageNumber: page ? Number(page) : undefined,
      PageSize: pageSize ? Number(pageSize) : undefined
    })
    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    // @ts-ignore
    response.data = payments

    res.status(200).json({ getPaymentsResponse: response })
  })

  /**
   * Obtiene un pago por su uiAuthorization
   */
  getPaymentByUiAuthorization = catchAsync(
    async (req: Request, res: Response) => {
      const response = {
        responseCode: '',
        message: '',
        status: '',
        data: []
      }

      const { codEmployee, uiAuthorization } = req.params

      console.log(codEmployee, uiAuthorization)

      const payment = await getPaymentByUiAuthorizationDB({
        CodEmployee: codEmployee as string,
        UiAuthorization: uiAuthorization as string
      })
      response.responseCode = RESPONSE_CODE_SUCCESS
      response.message = RESPONSE_MESSAGE_SUCCESS
      response.status = RESPONSE_STATUS_SUCCESS
      // @ts-ignore
      response.data = payment

      res.status(200).json({ getPaymentByUiAuthorizationResponse: response })
    }
  )

  /**
   * Firma el pago por el colaborador (administrativo)
   */
  signOnBehalf = catchAsync(async (req: Request, res: Response) => {
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: {}
    }

    const { codEmployee, uiAuthorization, signedBy } = req.body

    // Import lazily or assumes imported.
    // Wait, I need to make sure signPaymentOnBehalfDB is imported.
    // I'll update imports in a separate step or just assume it (but better be safe).
    // Let's rely on the previous tool to have added the export, but I need to import it here.
    // I will add the method first, then fix imports.

    // Correction: I should fix imports first or do it all together if possible.
    // Since I can't edit imports and class body in one contiguous block easily if they are far apart, I'll do two edits.

    // This edit adds the method.
    const result = await import('~/database/paymentDB').then(m =>
      m.signPaymentOnBehalfDB({
        CodEmployee: codEmployee,
        UiAuthorization: uiAuthorization,
        SignedBy: signedBy
      })
    )

    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    // @ts-ignore
    response.data = result[0]

    res.status(200).json({ signOnBehalfResponse: response })
  })
}

const paymentController = new PaymentController()
export default paymentController
