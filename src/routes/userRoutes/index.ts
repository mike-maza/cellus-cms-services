import { Router } from 'express'
import { authMiddleware } from '~/middleware/authMiddleware'
import userController from '~/controller/userController'
import credentialsController from '~/controller/credentialsController'

class UserRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.get('/get-users', authMiddleware, userController.getAllUsers)
    this.router.post('/create-user', authMiddleware, userController.createUser)
    this.router.put('/update-user', authMiddleware, userController.updateUser)

    // Rutas ahora manejadas por el controlador de credenciales
    this.router.put(
      '/update-password/:id',
      authMiddleware,
      credentialsController.changesPassword
    )
    this.router.put(
      '/changes-password/:id',
      authMiddleware,
      credentialsController.changesPassword
    )

    this.router.post('/reset-password', authMiddleware)
  }
}

const userRoutes = new UserRoutes()
export default userRoutes.router
