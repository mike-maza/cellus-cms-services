import { Router } from 'express'
import { authMiddleware } from '~/middleware/authMiddleware'
import permissionsController from '~/controller/PermissionsController'

class PermissionsRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.get(
      '/get-permissions',
      authMiddleware,
      permissionsController.getPermissions
    )
    this.router.get(
      '/get-permissions-by-role/:roleId',
      authMiddleware,
      permissionsController.getPermissionsByRole
    )
  }
}

const permissionsRoutes = new PermissionsRoutes()
export default permissionsRoutes.router
