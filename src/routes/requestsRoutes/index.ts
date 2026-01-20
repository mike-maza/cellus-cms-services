import { Router } from 'express'
import { authMiddleware } from '~/middleware/authMiddleware'

class RequestsRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.get('/get-requests', authMiddleware)
    this.router.post('/create-request', authMiddleware)
    this.router.post('/answer-request/:id', authMiddleware)
  }
}

const requestsRoutes = new RequestsRoutes()
export default requestsRoutes.router
