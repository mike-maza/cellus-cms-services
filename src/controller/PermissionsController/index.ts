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
  db_getPermissions,
  db_getPermissionsByRole
} from '~/database/permissionsDB'
import { catchAsync } from '~/utils/catchAsync'

class PermissionsController {
  /**
   * Obtiene todos los permisos
   */
  public getPermissions = catchAsync(async (req: Request, res: Response) => {
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const permissions = await db_getPermissions()
    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    // @ts-ignore
    response.data = permissions

    res.send({ getPermissionsResponse: response })
  })

  /**
   * Obtiene los permisos por rol
   */
  public getPermissionsByRole = catchAsync(
    async (req: Request, res: Response) => {
      const { roleId } = req.params
      const response = {
        responseCode: '',
        message: '',
        status: '',
        data: []
      }

      const permissions = await db_getPermissionsByRole(Number(roleId))
      response.responseCode = RESPONSE_CODE_SUCCESS
      response.message = RESPONSE_MESSAGE_SUCCESS
      response.status = RESPONSE_STATUS_SUCCESS
      // @ts-ignore
      response.data = permissions

      res.send({ getPermissionsByRoleResponse: response })
    }
  )
}

const permissionsController = new PermissionsController()
export default permissionsController
