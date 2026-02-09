import { Router } from 'express'
import { authMiddleware } from '~/middleware/authMiddleware'

class SessionRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.get('/get-session', authMiddleware)
  }
}

const sessionRoutes = new SessionRoutes()
export default sessionRoutes.router
