import { Router } from 'express'
import { authMiddleware } from '~/middleware/authMiddleware'
import employeeController from '~/controller/employeeController'

class EmployeeRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.get(
      '/get-employees',
      // authMiddleware,
      employeeController.getEmployees
    )
    this.router.get(
      '/get-employees/:id',
      authMiddleware,
      employeeController.getEmployeeById
    )
    this.router.get('/get-employees/pictures/:id', authMiddleware)
    this.router.post(
      '/create-employee',
      authMiddleware,
      employeeController.createEmployee
    )
    this.router.put(
      '/update-employee',
      authMiddleware,
      employeeController.updateEmployee
    )
    this.router.put('/update-employee/reset-configuration/:id', authMiddleware)
  }
}

const employeeRoutes = new EmployeeRoutes()
export default employeeRoutes.router
