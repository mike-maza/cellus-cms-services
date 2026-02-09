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
  db_getAllCompanies,
  db_getCompanyById,
  db_createCompany,
  db_updateCompany
} from '~/database/companiesDB'
import { catchAsync } from '~/utils/catchAsync'

class CompaniesController {
  /**
   * Obtiene todas las empresas
   */
  /**
   * Obtiene todas las empresas
   */
  public getAllCompanies = catchAsync(async (req: Request, res: Response) => {
    const response = {
      responseCode: '',
      message: '',
      status: '',
      companies: []
    }

    const companies = await db_getAllCompanies()
    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    // @ts-ignore
    response.companies = companies

    res.send({ getAllCompanies: response })
  })

  /**
   * Obtiene una empresa por ID
   */
  public getCompanyById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const company = await db_getCompanyById(id as string)
    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    // @ts-ignore
    response.data = company

    res.send({ getCompanyByIdResponse: response })
  })

  /**
   * Crea una nueva empresa
   */
  public createCompany = catchAsync(async (req: Request, res: Response) => {
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const result = await db_createCompany(req.body)
    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    // @ts-ignore
    response.data = result

    res.send({ createCompanyResponse: response })
  })

  /**
   * Actualiza una empresa
   */
  public updateCompany = catchAsync(async (req: Request, res: Response) => {
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const result = await db_updateCompany(req.body)
    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    // @ts-ignore
    response.data = result

    res.send({ updateCompanyResponse: response })
  })
}

const companiesController = new CompaniesController()
export default companiesController
