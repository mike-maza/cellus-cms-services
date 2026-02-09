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
  db_getAllUsers,
  db_createUser,
  db_updateUser,
  db_getProfile,
  db_updateProfile
} from '~/database/usersDB'

import { catchAsync } from '~/utils/catchAsync'
import { generatePassword } from '~/utils/generateUniqueId'

class UserController {
  /**
   * Obtiene todos los usuarios
   */
  /**
   * Obtiene todos los usuarios
   */
  public getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const users = await db_getAllUsers()

    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    // @ts-ignore
    response.data = users

    res.send({ getAllUsersResponse: response })
  })

  /**
   * Crea un nuevo usuario
   */
  public createUser = catchAsync(async (req: Request, res: Response) => {
    const response = {
      responseCode: '',
      message: '',
      status: ''
    }

    const { firstName, lastName, email, role, isActive } = req.body
    const { username } = (req as any).user

    // Generar contraseña automática
    const password = generatePassword()

    // Mapear propiedades del frontend a los parámetros del SP
    const userData = {
      firstName,
      lastName,
      email,
      password,
      roleId: parseInt(role, 10),
      createdByUsername: username,
      enabledUser: isActive ? 1 : 0
    }

    const result = await db_createUser(userData)
    response.responseCode = RESPONSE_CODE_SUCCESS
    // response.message = RESPONSE_MESSAGE_SUCCESS
    response.message = result[0].Message || RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    // @ts-ignore
    // response.data = result

    res.send({ createUserResponse: response })
  })

  /**
   * Actualiza un usuario
   */
  public updateUser = catchAsync(async (req: Request, res: Response) => {
    const response = {
      responseCode: '',
      message: '',
      status: ''
    }

    const {
      Username,
      FirstName,
      LastName,
      Email,
      Password,
      Status,
      RoleID,
      changesPassword,
      confirmPassword
    } = req.body

    // Validar coincidencia de contraseña si changesPassword es true
    if (changesPassword) {
      if (!Password || Password !== confirmPassword) {
        response.responseCode = RESPONSE_CODE_FAIL
        response.message = 'Las contraseñas no coinciden'
        response.status = RESPONSE_STATUS_FAIL
        return res.send({ updateUserResponse: response })
      }
    }

    const userData = {
      username: Username,
      firstName: FirstName,
      lastName: LastName,
      email: Email,
      password: changesPassword ? Password : '',
      roleId: RoleID,
      enabledUser: Status !== undefined ? (Status ? 1 : 0) : 1
    }

    const result = await db_updateUser(userData)
    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = result[0].Message || RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS

    return res.send({ updateUserResponse: response })
  })
}

const userController = new UserController()
export default userController
