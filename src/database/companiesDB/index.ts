import { executeStoredProcedure } from '~/database/connection'
import { PROCEDURES } from '../procedures'

export const getAllCompaniesDB = async (): Promise<any[]> => {
  try {
    return await executeStoredProcedure(PROCEDURES.GET_COMPANIES)
  } catch (err) {
    console.error(err)
    throw err
  }
}

export const getCompanyByIdDB = async (id: string) => {
  try {
    return await executeStoredProcedure(PROCEDURES.GET_COMPANY_BY_ID, { id })
  } catch (err) {
    console.error(err)
    throw err
  }
}

export const createCompanyDB = async (data: any) => {
  try {
    return await executeStoredProcedure(PROCEDURES.CREATE_COMPANY, data)
  } catch (err) {
    console.error(err)
    throw err
  }
}

export const updateCompanyDB = async (data: any) => {
  try {
    return await executeStoredProcedure(PROCEDURES.UPDATE_COMPANY, data)
  } catch (err) {
    console.error(err)
    throw err
  }
}
