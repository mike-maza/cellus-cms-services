import {
  getConnection2 as getConnection,
  executeStoredProcedure
} from '~/database/connection'
import { BITACORA_TICKETS } from '~/types'
import { PROCEDURES } from '../procedures'

export const insertOrUpdateBoletaDB = async (boleta: BITACORA_TICKETS) => {
  try {
    const {
      CodEmployee,
      FullName,
      SheetName,
      NoBoleta,
      PaymentIndicator,
      PayDay,
      UiAuthorization,
      Comments,
      BiweeklyAdvance,
      TotalOvertime,
      Bonus,
      Bonus79,
      TotalBiweeklyToPay,
      TotalDeductions,
      Total,
      AmountDays,
      DAY,
      MONTH,
      YEAR,
      Bonus14,
      BonusDecember,
      Accreditation1,
      Accreditation2,
      UserWhoCreates,
      deducciones
    } = boleta

    const pool = await getConnection()

    // Verificar si el pago ya existe en la base de datos
    const verificarPago = await pool
      ?.request()
      .input('codEmployee', CodEmployee)
      .input('sheetName', SheetName)
      .execute('sp_VerifyPayment') // Stored procedure para verificar si existe el pago

    // Si el pago ya existe, no hacer nada
    if (verificarPago && verificarPago.recordset?.length > 0) {
      console.log('Pago ya existe en la base de datos')

      return {
        success: true,
        status: 'existing'
      }
    }

    // Insertar la boleta principal
    const boletaPromise = await pool
      ?.request()
      .input('CodEmployee', CodEmployee)
      .input('FullName', FullName)
      .input('SheetName', SheetName)
      .input('NoBoleta', NoBoleta)
      .input('PaymentIndicator', PaymentIndicator)
      .input('PayDay', PayDay)
      .input('UiAuthorization', UiAuthorization)
      .input('Comments', Comments)
      .input('BiweeklyAdvance', BiweeklyAdvance)
      .input('TotalOvertime', TotalOvertime)
      .input('Bonus', Bonus)
      .input('Bonus79', Bonus79)
      .input('TotalBiweeklyToPay', TotalBiweeklyToPay)
      .input('TotalDeductions', TotalDeductions)
      .input('Total', Total)
      .input('AmountDays', AmountDays)
      .input('dayNum', DAY)
      .input('monthNum', MONTH)
      .input('yearNum', YEAR)
      .input('Bonus14', Bonus14)
      .input('BonusDecember', BonusDecember)
      .input('Accreditation1', Accreditation1)
      .input('Accreditation2', Accreditation2)
      .input('UserWhoCreates', UserWhoCreates)
      .execute('sp_CreatedPayment')

    const deduccionesPromises = deducciones?.map((deduccion: any) => {
      return pool
        .request()
        .input('uiAuthorization', UiAuthorization)
        .input('CodEmployee', CodEmployee)
        .input('typeDeduction', deduccion.tipo)
        .input('amount', deduccion.monto)
        .input('observations', deduccion.observaciones)
        .execute('sp_CreatedPaymentDeductions') // Tu stored procedure para deducciones
    })

    // Ejecutar todo en paralelo
    await Promise.all([deduccionesPromises])

    console.log('Boleta y deducciones insertadas exitosamente')
    return { success: true, status: 'created' }
  } catch (error) {
    console.error('Error al insertar o actualizar la boleta:', error)
  }
}

export const getBoletoOrnatoData = async () => {
  try {
    // return await executeStoredProcedure(PROCEDURES.GET_BOLETO_ORNATO_DATA)
    return 'hola'
  } catch (error) {
    throw error
  }
}
