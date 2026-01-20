import { Router } from 'express'
import advanceController from '~/controller/advanceController'
import { authMiddleware } from '~/middleware/authMiddleware'

class AdvanceRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.get('/data', authMiddleware, advanceController.getAdvances)
    this.router.post('/create', authMiddleware, advanceController.createAdvance)
    this.router.put(
      '/update/:id',
      authMiddleware,
      advanceController.updateAdvance
    )
  }
}

const advanceRoutes = new AdvanceRoutes()
export default advanceRoutes.router
