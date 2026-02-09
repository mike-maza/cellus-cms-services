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
    this.router.post('/login', credentialsController.getCredentials)
    this.router.post(
      '/refresh-token',
      authMiddleware,
      credentialsController.refreshToken
    )
    this.router.put(
      '/changes-password/:username',
      authMiddleware,
      credentialsController.changesPassword
    )
    this.router.get(
      '/get-profile/:username',
      authMiddleware,
      credentialsController.getProfile
    )
    this.router.put(
      '/update-profile',
      authMiddleware,
      credentialsController.updateProfile
    )
    this.router.get(
      '/sessions/active/:username',
      authMiddleware,
      credentialsController.getActiveSessions
    )

    this.router.post(
      '/sessions/close',
      authMiddleware,
      credentialsController.closeSession
    )
    this.router.post(
      '/sessions/close-all/:username',
      authMiddleware,
      credentialsController.closeAllSessions
    )

    this.router.post(
      '/sessions/close-device/:username',
      authMiddleware,
      credentialsController.closeDeviceSessions
    )

    this.router.get(
      '/sessions/history/:username',
      authMiddleware,
      credentialsController.getSessionHistory
    )

    this.router.post('/logout', authMiddleware, credentialsController.logout)
  }
}

const credentialsRoutes = new CredentialsRoutes()
export default credentialsRoutes.router
