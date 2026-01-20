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
    this.router.get('/get-steps', authMiddleware, stepController.getSteps)
    this.router.get('/get-steps/:id', authMiddleware, stepController.getStepById)
    this.router.post('/create-step', authMiddleware, stepController.createStep)
    this.router.put('/update-step', authMiddleware, stepController.updateStep)
  }
}

const stepsRoutes = new StepsRoutes()
export default stepsRoutes.router
