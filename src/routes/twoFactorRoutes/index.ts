import { Router } from 'express'
import { authMiddleware } from '~/middleware/authMiddleware'
import twoFactorController from '~/controller/2FAController'

class TwoFactorRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.get(
      '/get-devices',
      authMiddleware,
      twoFactorController.getDevices
    )
    this.router.get(
      '/otp/generate',
      authMiddleware,
      twoFactorController.generateURL
    )
    this.router.post(
      '/otp/enroll',
      authMiddleware,
      twoFactorController.enrollDevice
    )
    this.router.post(
      '/otp/validate',
      authMiddleware,
      twoFactorController.validateCode
    )
    this.router.get(
      '/get-devices-by-user/:username',
      authMiddleware,
      twoFactorController.getDevicesByUser
    )
    this.router.delete(
      '/delete-device/:username/:deviceId',
      authMiddleware,
      twoFactorController.deleteDevice
    )
  }
}

const twoFactorRoutes = new TwoFactorRoutes()
export default twoFactorRoutes.router
