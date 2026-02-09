import { Request, Response } from 'express'
import { GoogleSheetsService } from '~/utils/connectGoogleSheet'
import { catchAsync } from '~/utils/catchAsync'
import { googleSheetsPaymentsPreview } from '~/utils/googleSheet'

class GoogleSheetsController {
  private googleSheetsService: GoogleSheetsService

  constructor() {
    this.googleSheetsService = new GoogleSheetsService()
  }

  listSpreadsheets = catchAsync(async (req: Request, res: Response) => {
    const queryTerm = (req.query.queryTerm as string) || ''
    const categoryTerm = (req.query.categoryTerm as string) || ''
    console.log(
      `[GoogleSheetsController] GET /list-spreadsheets - queryTerm: "${queryTerm}", categoryTerm: "${categoryTerm}"`
    )
    const spreadsheets = await this.googleSheetsService.listSpreadsheets(
      queryTerm,
      categoryTerm
    )
    console.log(
      `[GoogleSheetsController] Retornando ${spreadsheets.length} hojas de cálculo`
    )
    return res.status(200).json({
      success: true,
      data: spreadsheets
    })
  })

  getSheetNames = catchAsync(async (req: Request, res: Response) => {
    const spreadsheetId = req.params.spreadsheetId as string
    if (!spreadsheetId) {
      return res.status(400).json({
        success: false,
        message: 'spreadsheetId is required'
      })
    }
    const sheetNames =
      await this.googleSheetsService.getSheetNames(spreadsheetId)
    return res.status(200).json({
      success: true,
      data: sheetNames
    })
  })

  getServiceAccount = catchAsync(async (req: Request, res: Response) => {
    const email = this.googleSheetsService.getServiceAccount()
    return res.status(200).json({
      success: true,
      data: { email }
    })
  })

  getPreview = catchAsync(async (req: Request, res: Response) => {
    const spreadsheetId = req.params.spreadsheetId as string
    const sheetName = req.params.sheetName as string
    const action = req.query.action as string
    const username = req.query.username as string

    if (!spreadsheetId || !sheetName) {
      return res.status(400).json({
        success: false,
        message: 'spreadsheetId and sheetName are required'
      })
    }

    console.log(
      `[GoogleSheetsController] GET /get-preview - spreadsheetId: "${spreadsheetId}", sheetName: "${sheetName}", action: "${action}"`
    )

    if (action === 'googleSheetsPayments') {
      const result = await googleSheetsPaymentsPreview(
        spreadsheetId,
        sheetName,
        username || 'Administrador'
      )
      return res.status(200).json(result)
    }

    // Default simple preview for clients or other actions
    const range = `${sheetName}!A1:Z15`
    const data = await this.googleSheetsService.readSheet({
      spreadsheetId,
      range
    })
    return res.status(200).json({
      success: true,
      data: data
    })
  })
}

const googleSheetsController = new GoogleSheetsController()
export default googleSheetsController
