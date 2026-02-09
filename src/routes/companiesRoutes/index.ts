import { Router } from 'express'
import companiesController from '~/controller/companiesController'
import { authMiddleware } from '~/middleware/authMiddleware'

class CompaniesRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes(): void {
    this.router.get('/get-companies', authMiddleware, companiesController.getAllCompanies)
    this.router.get('/get-companies/:id', authMiddleware, companiesController.getCompanyById)
    this.router.post('/create-company', authMiddleware, companiesController.createCompany)
    this.router.put('/update-company', authMiddleware, companiesController.updateCompany)
    
    // Ruta legacy, mantener si es necesario
    this.router.get('/all', authMiddleware, companiesController.getAllCompanies)
  }
}

const companiesRoutes: Router = new CompaniesRoutes().router
export default companiesRoutes
