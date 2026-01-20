import { Router } from 'express'
import { authMiddleware } from '~/middleware/authMiddleware'
import boletasController from '~/controller/boletasController'

class BoletasRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.post('/save-boleta', authMiddleware, boletasController.insertOrUpdateBoleta)
    this.router.get('/get-boleto-ornato-data', authMiddleware, boletasController.getBoletoOrnatoData)
  }
}

const boletasRoutes = new BoletasRoutes()
export default boletasRoutes.router
