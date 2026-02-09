import { Router } from 'express'
import dashboardController from '~/controller/dashboardController'
import { authMiddleware } from '~/middleware/authMiddleware'

class DashbordRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.get(
      '/get-data',
      authMiddleware,
      dashboardController.getPayments
    )
  }
}

const dashboardRoutes = new DashbordRoutes()
export default dashboardRoutes.router
