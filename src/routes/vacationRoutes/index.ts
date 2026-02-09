import { Router } from 'express'
import vacationController from '~/controller/vacationController'
import { authMiddleware } from '~/middleware/authMiddleware'

class VacationRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.get(
      '/data',
      // authMiddleware,
      vacationController.getVacations
    )
    this.router.post(
      '/create',
      authMiddleware,
      vacationController.createVacation
    )
    this.router.put(
      '/update/:id',
      authMiddleware,
      vacationController.updateVacation
    )
    this.router.post(
      '/comment/:id',
      authMiddleware,
      vacationController.addComment
    )
  }
}

const vacationRoutes = new VacationRoutes()
export default vacationRoutes.router
