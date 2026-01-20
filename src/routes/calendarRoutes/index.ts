import { Router } from 'express'
import calendarController from '~/controller/calendarController'
import { authMiddleware } from '~/middleware/authMiddleware'

class CalendarRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.get('/events', authMiddleware, calendarController.getEvents)
  }
}

const calendarRoutes = new CalendarRoutes()
export default calendarRoutes.router
