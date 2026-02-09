import { Router } from 'express'
import { authMiddleware } from '~/middleware/authMiddleware'
import paymentController from '~/controller/paymentController'

class PaymentsRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.get(
      '/get-payments',
      authMiddleware,
      paymentController.getPayments
    )
    this.router.get(
      '/get-payment-by-uiauthorization/:uiAuthorization/:codEmployee',
      authMiddleware,
      paymentController.getPaymentByUiAuthorization
    )
    this.router.post(
      '/sign-on-behalf',
      authMiddleware,
      paymentController.signOnBehalf
    )
    // this.router.post('/create-payment', authMiddleware)
  }
}

const paymentsRoutes = new PaymentsRoutes()
export default paymentsRoutes.router
