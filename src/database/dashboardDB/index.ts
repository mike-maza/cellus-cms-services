import { executeStoredProcedure } from '~/database/connection'
import { PROCEDURES } from '~/database/procedures'

export const getDashboardDataDB = async () => {
  try {
    const response = await executeStoredProcedure(PROCEDURES.DASHBOARD_DATA)

    return response?.recordset
  } catch (error) {
    throw error
  }
}
