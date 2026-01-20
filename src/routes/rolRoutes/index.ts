import { Router } from 'express'
import { authMiddleware } from '~/middleware/authMiddleware'
import roleController from '~/controller/rolController'

class RolRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.get('/get-roles', authMiddleware, roleController.getRoles)
    this.router.get(
      '/get-roles-with-details',
      // authMiddleware,
      roleController.getRolesWithDetails
    )
    this.router.get('/get-role/:userId', authMiddleware)
    this.router.post('/create-role', authMiddleware, roleController.createRole)
    this.router.put('/update-role', authMiddleware, roleController.updateRole)
    this.router.delete('/delete-role/:id', authMiddleware)
  }
}

const rolRoutes = new RolRoutes()
export default rolRoutes.router
