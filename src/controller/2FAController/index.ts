import type { Request, Response } from 'express'

import { catchAsync } from '~/utils/catchAsync'

import { TwoFactorAuth } from '~/utils/2FA'
import { db_getAllDevicesOf2FA, db_deleteDevice2FA } from '~/database/2FADB'

class TwoFactorController {
  getDevices = catchAsync(async (req: Request, res: Response) => {
    const { username } = (req as any).user
    const devices = await db_getAllDevicesOf2FA(username)
    res.status(200).json(devices)
  })

  generateURL = catchAsync(async (req: Request, res: Response) => {
    try {
      const { username } = (req as any).user
      const { urlQR, secretCode } = await TwoFactorAuth.generateURL(username)
      res.status(200).json({ urlQR, secretCode })
    } catch (error) {
      console.error('Error al generar datos de 2FA:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  })

  enrollDevice = catchAsync(async (req: Request, res: Response) => {
    const { code, secret, deviceName } = req.body
    const { username } = (req as any).user

    return await TwoFactorAuth.validateCode(
      res,
      code,
      username,
      true, // register = true
      secret,
      '',
      deviceName
    )
  })

  validateCode = catchAsync(async (req: Request, res: Response) => {
    const { code, twoFactorID } = req.body
    const { username } = (req as any).user

    console.log(
      `Validando código OTP para ${username} con código ${code}, ID: ${twoFactorID}`
    )

    return await TwoFactorAuth.validateCode(
      res,
      code,
      username,
      false, // register = false,
      '',
      twoFactorID
    )
  })

  getDevicesByUser = catchAsync(async (req: Request, res: Response) => {
    const { username } = req.params
    const devices = await db_getAllDevicesOf2FA(username as string)
    res.status(200).json(devices)
  })

  deleteDevice = catchAsync(async (req: Request, res: Response) => {
    const { username, deviceId } = req.params
    const result = await db_deleteDevice2FA({
      Username: username as string,
      DeviceId: deviceId as string
    })
    res.status(200).json(result)
  })
}

const twoFactorController = new TwoFactorController()
export default twoFactorController
