import type { Request, Response } from 'express'
import {
  RESPONSE_CODE_SUCCESS,
  RESPONSE_MESSAGE_SUCCESS,
  RESPONSE_STATUS_SUCCESS
} from '~/constants/RESPONSE_MESSAGE'
import {
  db_getEmployees,
  db_getEmployeeById,
  db_createEmployee,
  db_updateEmployee,
  db_updateEmployeeWorkflow
} from '~/database/employeeDB'
import { catchAsync } from '~/utils/catchAsync'
import { GoogleSheetsService } from '~/utils/connectGoogleSheet'
import {
  COMPANY_SPREADSHEETS,
  SHEETS,
  COLUMNS,
  DB_TO_SHEET_COLUMNS
} from '~/constants/googleSheets'

class EmployeeController {
  /**
   * Obtiene todos los empleados
   */
  /**
   * Obtiene todos los empleados
   */
  getEmployees = catchAsync(async (req: Request, res: Response) => {
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const { page, pageSize } = req.query

    const employees = await db_getEmployees({
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
  getEmployeeById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const employee = await db_getEmployeeById(id as string)
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
  createEmployee = catchAsync(async (req: Request, res: Response) => {
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const result = await db_createEmployee(req.body)
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
  updateEmployee = catchAsync(async (req: Request, res: Response) => {
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    delete req.body.TotalVacations

    const { username } = (req as any)?.user

    const result = await db_updateEmployee({
      ...req.body,
      UpdatedByUsername: username
    })
    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    // @ts-ignore
    response.data = result

    // Sincronizar con Google Sheets para TODOS los campos actualizados
    if (req.body.Company && req.body.CodEmployee) {
      try {
        const spreadsheetId = COMPANY_SPREADSHEETS[req.body.Company]
        if (spreadsheetId) {
          const googleSheetsService = new GoogleSheetsService()

          // Iterar sobre todos los campos en el cuerpo de la petición
          for (const [key, value] of Object.entries(req.body)) {
            // Verificar si este campo tiene un mapeo a una columna de Google Sheet
            // Y asegurarse de no actualizar el identificador clave (CodEmployee) aunque es poco probable que cambie aquí
            if (key !== 'CodEmployee' && DB_TO_SHEET_COLUMNS[key]) {
              const sheetColumnName = DB_TO_SHEET_COLUMNS[key]

              // ¿Evitar enviar null/undefined a la hoja? Convertir a cadena vacía si es necesario o dejarlo como cadena 'null'
              // Usualmente las hojas prefieren cadena vacía para null
              const valueToUpdate =
                value === null || value === undefined ? '' : String(value)

              await googleSheetsService.updateField(
                spreadsheetId,
                SHEETS.EMPLOYEES,
                COLUMNS.COD_EMPLOYEE,
                req.body.CodEmployee,
                sheetColumnName,
                valueToUpdate
              )
            }
          }
        }
      } catch (error) {
        console.error('Error sincronizando con Google Sheets:', error)
        // No fallar la petición si la sincronización con la hoja falla
      }
    }

    res.send({ updateEmployeeResponse: response })
  })

  updateEmployeeWorkflow = catchAsync(async (req: Request, res: Response) => {
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    delete req.body.ProcessStepId

    const result = await db_updateEmployeeWorkflow(req.body)
    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    // @ts-ignore
    response.data = result

    res.send({ updateEmployeeWorkflowResponse: response })
  })
}

const employeeController = new EmployeeController()
export default employeeController
