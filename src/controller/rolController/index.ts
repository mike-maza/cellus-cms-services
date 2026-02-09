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
  db_getRoles,
  db_createRole,
  db_updateRole,
  db_getRolesWithDetails,
  db_disactivateRole,
  db_asignRole
} from '~/database/rolesDB'
import { catchAsync } from '~/utils/catchAsync'

class RoleController {
  /**
   * Obtiene todos los roles
   */
  getRoles = catchAsync(async (req: Request, res: Response) => {
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const roles = await db_getRoles()
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
  getRolesWithDetails = catchAsync(async (req: Request, res: Response) => {
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const roles = await db_getRolesWithDetails()
    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    // @ts-ignore
    response.data = roles

    res.send({ getRolesWithDetailsResponse: response })
  })

  /**
   * Crea un nuevo rol
   */
  createRole = catchAsync(async (req: Request, res: Response) => {
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const result = await db_createRole(req.body)
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
  updateRole = catchAsync(async (req: Request, res: Response) => {
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const result = await db_updateRole(req.body)
    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    // @ts-ignore
    response.data = result

    res.send({ updateRoleResponse: response })
  })

  asignRole = catchAsync(async (req: Request, res: Response) => {
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const { username, roleId, assignedByUsername } = req.body
   

    const result = await db_asignRole(username, roleId, assignedByUsername)
    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS

    response.data = result

    res.send({ asignRoleResponse: response })
  })

  disactivateRole = catchAsync(async (req: Request, res: Response) => {
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const { username } = req.params
    const { roleId } = req.body

    const result = await db_disactivateRole(username as string, roleId)
    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    // @ts-ignore
    response.data = result

    res.send({ disactivateRoleResponse: response })
  })
}

const roleController = new RoleController()
export default roleController
