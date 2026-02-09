import { Router } from 'express'
import { authMiddleware } from '~/middleware/authMiddleware'
import googleSheetsController from '~/controller/googleSheetsController'

class GoogleSheetsRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.get(
      '/list-spreadsheets',
      authMiddleware,
      googleSheetsController.listSpreadsheets
    )
    this.router.get(
      '/get-sheet-names/:spreadsheetId',
      authMiddleware,
      googleSheetsController.getSheetNames
    )
    this.router.get(
      '/service-account',
      authMiddleware,
      googleSheetsController.getServiceAccount
    )
    this.router.get(
      '/get-preview/:spreadsheetId/:sheetName',
      authMiddleware,
      googleSheetsController.getPreview
    )
  }
}

const googleSheetsRoutes = new GoogleSheetsRoutes()
export default googleSheetsRoutes.router
