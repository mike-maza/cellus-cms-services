import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { catchAsync } from '~/utils/catchAsync'
import { getPassword, changePassword, login, logout } from '~/database/usersDB'

class CredentialsController {
  /**
   * Obtiene las credenciales (password) de un usuario
   */
  getCredentials = catchAsync(async (req: Request, res: Response) => {
    const { userID } = req.params
    const data = await getPassword({ id: userID })
    res.status(200).json({
      status: 'success',
      data
    })
  })

  /**
   * Refresca el token de autenticación (Boilerplate)
   */
  refreshToken = catchAsync(async (req: Request, res: Response) => {
    // Boilerplate para refresh token
    res.status(200).json({
      status: 'success',
      message: 'Token refrescado correctamente'
    })
  })

  /**
   * Realiza el cambio de contraseña
   */
  changesPassword = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const { password, newPassword } = req.body

    const result = await changePassword({ id, password, newPassword })

    res.status(200).json({
      status: 'success',
      message: 'Contraseña actualizada exitosamente',
      data: result
    })
  })

  /**
   * Inicio de sesión
   */
  login = catchAsync(async (req: Request, res: Response) => {
    const result = await login(req.body)
    res.status(200).json({
      status: 'success',
      data: result
    })
  })

  /**
   * Cierre de sesión
   */
  logout = catchAsync(async (req: Request, res: Response) => {
    const result = await logout(req.body)
    res.status(200).json({
      status: 'success',
      data: result
    })
  })
}

const credentialsController = new CredentialsController()
export default credentialsController
