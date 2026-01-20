import type { Request, Response } from 'express'
import {
  RESPONSE_CODE_FAIL,
  RESPONSE_CODE_SUCCESS,
  RESPONSE_MESSAGE_FAIL,
  RESPONSE_MESSAGE_SUCCESS,
  RESPONSE_STATUS_FAIL,
  RESPONSE_STATUS_SUCCESS
} from '~/constants/RESPONSE_MESSAGE'
import {
  getVacations,
  createVacation,
  updateVacation,
  addCommentToVacation
} from '~/database/vacationDB'
import { catchAsync } from '~/utils/catchAsync'
import { mockVacacionesData } from '~/constants/mockData'

class VacationController {
  /**
   * Obtiene todas las vacaciones
   */
  /**
   * Obtiene todas las vacaciones
   */
  public getVacations = catchAsync(async (req: Request, res: Response) => {
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const vacations = await getVacations()
    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    // @ts-ignore
    response.data = vacations

    res.send({ getVacationsResponse: response })
  })

  /**
   * Crea una nueva solicitud de vacaciones
   */
  public createVacation = catchAsync(async (req: Request, res: Response) => {
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const result = await createVacation(req.body)
    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    // @ts-ignore
    response.data = result

    res.send({ createVacationResponse: response })
  })

  /**
   * Actualiza una solicitud de vacaciones
   */
  public updateVacation = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const result = await updateVacation(id as string, req.body)
    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    // @ts-ignore
    response.data = result

    res.send({ updateVacationResponse: response })
  })

  /**
   * Agrega un comentario a una solicitud
   */
  public addComment = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    const result = await addCommentToVacation(id as string, req.body)
    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    // @ts-ignore
    response.data = result

    res.send({ addCommentResponse: response })
  })
}

const vacationController = new VacationController()
export default vacationController
