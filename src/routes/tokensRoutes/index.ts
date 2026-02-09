import { Router } from 'express'
import { authMiddleware } from '~/middleware/authMiddleware'

class TokensRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.get('/get-tokens', authMiddleware)
  }
}

const tokensRoutes = new TokensRoutes()
export default tokensRoutes.router
