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
  db_getVacations,
  db_createVacation,
  db_updateVacation
} from '~/database/vacationDB'
import { catchAsync } from '~/utils/catchAsync'

class CalendarController {
  /**
   * Obtiene eventos del calendario (vacaciones, cumpleaños etc)
   */
  /**
   * Obtiene eventos del calendario (vacaciones, cumpleaños etc)
   */
  public getEvents = catchAsync(async (req: Request, res: Response) => {
    const response = {
      responseCode: '',
      message: '',
      status: '',
      data: []
    }

    // Por ahora agregamos solo vacaciones como eventos
    // En el futuro podemos agregar cumpleaños de empleados, dias festivos, etc
    const vacations = await db_getVacations()

    const events = vacations.map(v => ({
      id: v.id,
      employeeName: v.empleadoNombre,
      // employeeAvatar: v.empleadoAvatar, // Si el frontend lo necesita
      type: 'vacation',
      startDate: v.fechaInicio, // Asegurarse que el formato sea compatible
      endDate: v.fechaFin,
      description: v.motivo
    }))

    response.responseCode = RESPONSE_CODE_SUCCESS
    response.message = RESPONSE_MESSAGE_SUCCESS
    response.status = RESPONSE_STATUS_SUCCESS
    // @ts-ignore
    response.data = events

    res.send({ getEventsResponse: response })
  })
}

const calendarController = new CalendarController()
export default calendarController
