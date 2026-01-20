import { Router } from 'express'
import dynamicController from '~/controller/dynamicController'
import { authMiddleware } from '~/middleware/authMiddleware'

class DynamicRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes(): void {
    // Dynamic endpoints
    // :company is the sanitized name of the company (e.g. 'coca_cola')
    this.router.get(
      '/:company/employees',
      authMiddleware,
      dynamicController.getEmployees
    )
    this.router.post(
      '/:company/payments',
      authMiddleware,
      dynamicController.createPayment
    )
  }
}

const dynamicRoutes: Router = new DynamicRoutes().router
export default dynamicRoutes
