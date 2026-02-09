import axios from 'axios'

/**
 * Interface for the SMS response structure from the external provider
 */
type SendSMSResponse = {
  SendSMSResponseCode: {
    responseCode: string
    message: string
    status: string
  }
}

/**
 * Sends a temporary password via SMS to a specified contact.
 *
 * @async
 * @param {string} contact - Recipient phone number
 * @param {string} password - Temporary password to send
 * @returns {Promise<SendSMSResponse>}
 */
export const sendSMS = async (
  contact: string,
  password: string
): Promise<SendSMSResponse> => {
  const endpoint = process.env.ENDPOINT_SMS

  if (!endpoint) {
    throw new Error(
      'Config Error: ENDPOINT_SMS is not defined in environment variables.'
    )
  }

  const dataSend = {
    number: contact,
    message: `Su contraseña temporal es: ${password}`,
    reason: 'Cambio de contraseña - Payments'
  }

  console.log(`[SMS] Sending password to recipient: ${contact}`)

  try {
    const response = await axios.post<SendSMSResponse>(
      `${endpoint}/send-sms`,
      dataSend
    )
    return response.data
  } catch (error: any) {
    console.error(
      `[SMS Error] Failed to send SMS to ${contact}:`,
      error?.response?.data || error.message
    )
    throw error
  }
}
