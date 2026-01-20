import { Router } from 'express'
import { authMiddleware } from '~/middleware/authMiddleware'

class TwoFactorRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.get('/get-devices', authMiddleware)
    this.router.get('/opt/generate', authMiddleware)
    this.router.post('/opt/validate', authMiddleware)
    this.router.delete('/otp/remove-device/:deviceId/:userId', authMiddleware)
  }
}

const twoFactorRoutes = new TwoFactorRoutes()
export default twoFactorRoutes.router
