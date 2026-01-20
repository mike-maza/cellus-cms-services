import { executeStoredProcedure } from './connection'
import { PROCEDURES } from './procedures'

export const getPayments = async (params?: {
  YearMonths?: string | undefined
  PageNumber?: number | undefined
  PageSize?: number | undefined
}) => {
  try {
    const payments = await executeStoredProcedure<any[]>(
      PROCEDURES.GET_PAYMENTS,
      {
        ...(params ? { params } : {}),
        useCache: true,
        cacheTTL: 5 * 60 * 1000 // 5 minutos de caché
      }
    )

    return payments.map(ticket => ({
      ...ticket,
      Signature: ticket.Signature ? ticket.Signature : false,
      bufferImage: ticket.bufferImage
        ? ticket.bufferImage.toString('base64')
        : '',
      SendDate: ticket.SendDate ? 'Enviada' : '',
      Boleta: ticket.Email.length > 5 ? 'Digital' : 'Fisica'
    }))
  } catch (err) {
    console.error(err)
    throw err
  }
}

export const getPaymentByUiAuthorizationDB = async (params: {
  CodEmployee: string
  UiAuthorization: string
}) => {
  try {
    const payment = await executeStoredProcedure<any[]>(
      PROCEDURES.GET_PAYMENT_BY_ID,
      {
        params,
        useCache: true,
        cacheTTL: 5 * 60 * 1000 // 5 minutos de caché
      }
    )

    return payment.map(ticket => ({
      ...ticket,
      bufferImage: ticket.bufferImage
        ? ticket.bufferImage.toString('base64')
        : ''
    }))
  } catch (err) {
    console.error(err)
    throw err
  }
}

export const signPaymentOnBehalfDB = async (params: {
  CodEmployee: string
  UiAuthorization: string
  SignedBy: string
}) => {
  try {
    // Attempt to execute the Stored Procedure
    // Note: Since this SP might not exist yet, we capture the error and return a mock for simulation
    /* 
    const result = await executeStoredProcedure<any[]>(
      PROCEDURES.SIGN_PAYMENT_ON_BEHALF,
      {
        params
      }
    ) 
    return result
    */

    // SIMULATION: Return a success mock with a generated signature
    // In a real scenario, the SP would generate/save this and return it.
    // We simulate a delay
    await new Promise(resolve => setTimeout(resolve, 800))

    // Simulating "Cursive Name" signature if it doesn't exist
    // Returning a signature string (mocking a URL or base64)
    return [
      {
        Success: true,
        Message: 'Signed successfully on behalf of employee',
        SignatureAuthorization: 'SignedByManager_CursiveSimulation_12345'
      }
    ]
  } catch (err) {
    console.error(err)
    throw err
  }
}
