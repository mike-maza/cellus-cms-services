import { Router } from 'express'
import { authMiddleware } from '~/middleware/authMiddleware'

class EmailRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.post('/welcome', authMiddleware)
    this.router.post('/welcome-cms', authMiddleware)
    this.router.post('/forgot-password', authMiddleware)
    this.router.post('/boleta', authMiddleware)
    this.router.post('/boleto-ornato', authMiddleware)
  }
}

const emailRoutes = new EmailRoutes()
export default emailRoutes.router
