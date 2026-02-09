import { Router } from 'express'
import { authMiddleware } from '~/middleware/authMiddleware'
import stepController from '~/controller/stepController'

class StepsRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.get(
      '/get-step/:username',
      authMiddleware,
      stepController.getStepsByUser
    )

    this.router.put(
      '/reset-step/:username/:stepName',
      authMiddleware,
      stepController.resetUserStep
    )

    this.router.delete(
      '/delete-step/:username/:stepName',
      authMiddleware,
      stepController.deleteUserStep
    )
  }
}

const stepsRoutes = new StepsRoutes()
export default stepsRoutes.router
