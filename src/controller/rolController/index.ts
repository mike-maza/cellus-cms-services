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
  getRoles,
  createRole,
  updateRole,
  getRolesWithDetails
} from '~/database/rolesDB'
import { catchAsync } from '~/utils/catchAsync'

class RoleController {
  /**
   * Obtiene todos los roles
   */
  public getRoles = catchAsync(async (req: Request, res: Response) => {
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const roles = await getRoles()
    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    // @ts-ignore
    response.data = roles

    res.send({ getRolesResponse: response })
  })

  /**
   * Obtiene todos los roles con sus detalles
   */
  public getRolesWithDetails = catchAsync(
    async (req: Request, res: Response) => {
      const response = {
        responseCode: '',
        message: '',
        status: '',
        data: []
      }

      console.log('aca')

      const roles = await getRolesWithDetails()
      response.responseCode = RESPONSE_CODE_SUCCESS
      response.message = RESPONSE_MESSAGE_SUCCESS
      response.status = RESPONSE_STATUS_SUCCESS
      // @ts-ignore
      response.data = roles

      res.send({ getRolesWithDetailsResponse: response })
    }
  )

  /**
   * Crea un nuevo rol
   */
  public createRole = catchAsync(async (req: Request, res: Response) => {
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const result = await createRole(req.body)
    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    // @ts-ignore
    response.data = result

    res.send({ createRoleResponse: response })
  })

  /**
   * Actualiza un rol
   */
  public updateRole = catchAsync(async (req: Request, res: Response) => {
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const result = await updateRole(req.body)
    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    // @ts-ignore
    response.data = result

    res.send({ updateRoleResponse: response })
  })
}

const roleController = new RoleController()
export default roleController
