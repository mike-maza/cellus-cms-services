import { executeStoredProcedure } from '~/database/connection'
import { PROCEDURES } from '~/database/procedures'

export const db_getDataRelevant = async () => {
  try {
    const response = await executeStoredProcedure(PROCEDURES.DASHBOARD_DATA, {
      useCache: true,
      cacheTTL: 5 * 60 * 1000 // 5 minutos de caché
    })

    return response[0]
  } catch (error) {
    throw error
  }
}
