import { PROCEDURES } from '~/database/procedures'
import {
  executeStoredProcedure,
  invalidateCachePattern
} from '~/database/connection'
import { BITACORA_TICKETS } from '~/types'

export const db_insertOrUpdateBoleta = async (boleta: BITACORA_TICKETS) => {
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

    // Verificar si el pago ya existe en la base de datos
    const verificarPago = await executeStoredProcedure<any[]>(
      PROCEDURES.VERIFY_PAYMENT_EXISTS,
      {
        params: {
          CodEmployee: CodEmployee,
          SheetName: SheetName
        }
      }
    )

    // Si el pago ya existe, no hacer nada
    if (verificarPago && verificarPago.length > 0) {
      return {
        success: true,
        status: 'existing'
      }
    }

    // Insertar la boleta principal
    await executeStoredProcedure(PROCEDURES.CREATED_PAYMENT, {
      params: {
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
        DayNum: DAY,
        MonthNum: MONTH,
        YearNum: YEAR,
        Bonus14,
        BonusDecember,
        Accreditation1,
        Accreditation2,
        UserWhoCreates
      }
    })

    const deduccionesPromises = deducciones?.map((deduccion: any) => {
      return executeStoredProcedure(PROCEDURES.CREATED_PAYMENT_DEDUCTIONS, {
        params: {
          UiAuthorization,
          CodEmployee,
          TypeDeduction: deduccion.tipo,
          Amount: deduccion.monto,
          Observations: deduccion.observaciones,
          CreatedBy: UserWhoCreates
        }
      })
    })

    // Ejecutar todo en paralelo
    if (deduccionesPromises) {
      await Promise.all(deduccionesPromises)
    }

    // Invalidar caché tras la creación exitosa
    invalidateCachePattern(PROCEDURES.GET_PAYMENTS)
    invalidateCachePattern(PROCEDURES.GET_PAYMENTS_METADATA)
    // invalidateCachePattern(PROCEDURES.DASHBOARD_PAYMENTS_DATA)

    return { success: true, status: 'created' }
  } catch (error) {
    console.error('Error al insertar o actualizar la boleta:', error)
  }
}

export const db_getPayments = async (params?: any) => {
  try {
    return await executeStoredProcedure(PROCEDURES.GET_PAYMENTS, {
      useCache: true,
      cacheTTL: 5 * 60 * 1000, // 5 minutos
      params
    })
  } catch (error) {
    throw error
  }
}

export const db_getBoletoOrnatoData = async () => {
  try {
    // return await executeStoredProcedure(PROCEDURES.GET_BOLETO_ORNATO_DATA)
    return 'hola'
  } catch (error) {
    throw error
  }
}
