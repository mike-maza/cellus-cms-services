import type { Request, Response } from 'express'
import {
  RESPONSE_CODE_SUCCESS,
  RESPONSE_MESSAGE_SUCCESS,
  RESPONSE_STATUS_SUCCESS
} from '~/constants/RESPONSE_MESSAGE'
import {
  getEmployeesDB,
  getEmployeeById,
  createEmployee,
  updateEmployee
} from '~/database/employeeDB'
import { catchAsync } from '~/utils/catchAsync'

class EmployeeController {
  /**
   * Obtiene todos los empleados
   */
  /**
   * Obtiene todos los empleados
   */
  public getEmployees = catchAsync(async (req: Request, res: Response) => {
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const { page, pageSize } = req.query

    const employees = await getEmployeesDB({
      PageNumber: page ? Number(page) : undefined,
      PageSize: pageSize ? Number(pageSize) : undefined
    })

    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    // @ts-ignore
    response.data = employees

    res.send({ getEmployeesResponse: response })
  })

  /**
   * Obtiene un empleado por ID
   */
  public getEmployeeById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const employee = await getEmployeeById(id as string)
    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    // @ts-ignore
    response.data = employee

    res.send({ getEmployeeByIdResponse: response })
  })

  /**
   * Crea un nuevo empleado
   */
  public createEmployee = catchAsync(async (req: Request, res: Response) => {
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const result = await createEmployee(req.body)
    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    // @ts-ignore
    response.data = result

    res.send({ createEmployeeResponse: response })
  })

  /**
   * Actualiza un empleado
   */
  public updateEmployee = catchAsync(async (req: Request, res: Response) => {
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const result = await updateEmployee(req.body)
    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    // @ts-ignore
    response.data = result

    res.send({ updateEmployeeResponse: response })
  })
}

const employeeController = new EmployeeController()
export default employeeController
