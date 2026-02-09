import type { Request, Response } from 'express'
import {
  RESPONSE_CODE_FAIL,
  RESPONSE_CODE_SUCCESS,
  RESPONSE_MESSAGE_FAIL,
  RESPONSE_MESSAGE_SUCCESS,
  RESPONSE_STATUS_FAIL,
  RESPONSE_STATUS_SUCCESS
} from '~/constants/RESPONSE_MESSAGE'
import { executeStoredProcedure } from '~/database/connection'
import { catchAsync } from '~/utils/catchAsync'

class DynamicController {
  /**
   * Helper to execute a dynamic stored procedure
   */
  private async executeDynamic(
    procPrefix: string,
    companyName: string,
    params: any = {}
  ) {
    // Sanitize company name to prevent injection/errors
    const suffix = companyName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
    const procName = `${procPrefix}_${suffix}`

    return await executeStoredProcedure(procName, { params })
  }

  /**
   * GET /:company/employees
   */
  /**
   * GET /:company/employees
   */
  public getEmployees = catchAsync(async (req: Request, res: Response) => {
    const { company } = req.params

    // Construct response template
    const response = {
      responseCode: RESPONSE_CODE_FAIL,
      message: RESPONSE_MESSAGE_FAIL,
      status: RESPONSE_STATUS_FAIL,
      data: []
    }

    // Based on procedures.sql: sp_CompanyGetAll or sp_CompanyGetById?
    // Since 'getAll' implies generic, but the prompt says dynamic *per company*,
    // we need to assume the templates allow for company-specific data query.
    // The provided `procedures.sql` has `sp_CompanyGetById`.
    // If we want "Employees" for a company, we need a procedure for that in the template.
    // The templates provided were "generic" (Users, Roles), not "Employees" specifically.
    // However, assuming the user *will* add an `sp_GetEmployees` or distinct logic,
    // we should keep the generic `executeDynamic` flexible.

    // Adaptation: The user provided `procedures.sql` has `sp_CompanyGetAll`, `sp_UserGetSteps`, etc.
    // It DOES NOT have `sp_GetEmployees`.
    // I will update the controller to call `sp_CompanyGetById` (suffixed) as a test,
    // or we assume the user puts whatever they want in that folder.

    const compName = company || ''
    const data = await this.executeDynamic('sp_CompanyGetById', compName, {
      name: compName
    })

    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    // @ts-ignore
    response.data = data

    res.send(response)
  })

  /**
   * POST /:company/payments
   * (Note: The user didn't provide sp_CreatePayment in the new file, but requested linkage.
   * I will keep the generic call but warn/comment that SP must exist)
   */
  public createPayment = catchAsync(async (req: Request, res: Response) => {
    const { company } = req.params
    const { employeeId, amount, description } = req.body

    const response = {
      responseCode: RESPONSE_CODE_FAIL,
      message: RESPONSE_MESSAGE_FAIL,
      status: RESPONSE_STATUS_FAIL,
      data: []
    }

    // Attempting to call a procedure that *should* be in the company schema
    // If strict usage of provided files, this might fail if not added.
    // But for the "Linkage" requirement, the controller mechanism is what matters.
    const compName = company || ''
    const data = await this.executeDynamic(
      'sp_CreatePayment',
      compName,
      req.body
    )

    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = 'Pago registrado correctamente'
    response.status = RESPONSE_STATUS_SUCCESS
    // @ts-ignore
    response.data = data

    res.send(response)
  })
}

const dynamicController = new DynamicController()
export default dynamicController
