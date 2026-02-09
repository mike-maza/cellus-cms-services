import { executeStoredProcedure } from '~/database/connection'
import { PROCEDURES } from '../procedures'

export const db_getAllCompanies = async (): Promise<any[]> => {
  try {
    return await executeStoredProcedure(PROCEDURES.GET_COMPANIES)
  } catch (err) {
    console.error(err)
    throw err
  }
}

export const db_getCompanyById = async (id: string) => {
  try {
    return await executeStoredProcedure(PROCEDURES.GET_COMPANY_BY_ID, {
      params: { id }
    })
  } catch (err) {
    console.error(err)
    throw err
  }
}

export const db_createCompany = async (data: any) => {
  try {
    return await executeStoredProcedure(PROCEDURES.CREATE_COMPANY, data)
  } catch (err) {
    console.error(err)
    throw err
  }
}

export const db_updateCompany = async (data: any) => {
  try {
    return await executeStoredProcedure(PROCEDURES.CREATE_COMPANY, {
      params: data
    })
  } catch (err) {
    console.error(err)
    throw err
  }
}
