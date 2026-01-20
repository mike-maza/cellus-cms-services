import { Router } from 'express'
import { authMiddleware } from '~/middleware/authMiddleware'
import credentialsController from '~/controller/credentialsController'

class CredentialsRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.get(
      '/get-credentials/:userID',
      authMiddleware,
      credentialsController.getCredentials
    )
    this.router.post('/login', credentialsController.login)
    this.router.post('/logout', authMiddleware, credentialsController.logout)
    this.router.post(
      '/refresh-token',
      authMiddleware,
      credentialsController.refreshToken
    )
    this.router.put(
      '/changes-password/:id',
      authMiddleware,
      credentialsController.changesPassword
    )
  }
}

const credentialsRoutes = new CredentialsRoutes()
export default credentialsRoutes.router
