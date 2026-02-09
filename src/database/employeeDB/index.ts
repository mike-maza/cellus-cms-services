import {
  executeStoredProcedure,
  invalidateCachePattern
} from '~/database/connection'
import { PROCEDURES } from '../procedures'

export const db_getEmployees = async (params?: {
  PageNumber?: number | undefined
  PageSize?: number | undefined
}) => {
  try {
    // Ejecutar ambas consultas en paralelo
    const [metadata, employees] = await Promise.all([
      executeStoredProcedure(PROCEDURES.GET_EMPLOYEES_METADATA),
      executeStoredProcedure(PROCEDURES.GET_EMPLOYEES, {
        ...(params ? { params } : {}),
        useCache: true,
        cacheTTL: 5 * 60 * 1000 // 5 minutos de caché
      })
    ])

    // Combinar los resultados
    return {
      ...metadata[0], // TotalRecords, TotalActive, TotalInactive, etc.
      Employees: employees // El array de empleados
    }
  } catch (error) {
    console.error(`Error al obtener los empleados: ${error}`)

    throw new Error(`Error al obtener los empleados: ${error}`)
  }
}

export const db_getEmployeeById = async (id: string) => {
  try {
    const get_employee_by_id = await executeStoredProcedure(
      // PROCEDURES.GET_EMPLOYEE_BY_ID,
      PROCEDURES.GET_PAYMENT_BY_ID,
      { params: { id } }
    )

    return get_employee_by_id.recordset
  } catch (error) {
    console.error(`Error al obtener el empleado: ${error}`)

    throw new Error(`Error al obtener el empleado: ${error}`)
  }
}

export const db_createEmployee = async (data: any) => {
  try {
    const result = await executeStoredProcedure(PROCEDURES.CREATE_EMPLOYEE, {
      params: data
    })

    invalidateCachePattern(PROCEDURES.GET_EMPLOYEES)
    return result
  } catch (error) {
    console.error(`Error al crear el empleado: ${error}`)

    throw new Error(`Error al crear el empleado: ${error}`)
  }
}

export const db_updateEmployee = async (data: any) => {
  try {
    await executeStoredProcedure(PROCEDURES.UPDATE_EMPLOYEE, { params: data })
    invalidateCachePattern(PROCEDURES.GET_EMPLOYEES)
    return 'Empleado actualizado correctamente'
  } catch (error) {
    console.error(`Error al actualizar el empleado: ${error}`)

    throw new Error(`Error al actualizar el empleado: ${error}`)
  }
}

export const db_updateEmployeeWorkflow = async (data: any) => {
  try {
    await executeStoredProcedure(PROCEDURES.UPDATE_EMPLOYEE_WORKFLOW, {
      params: data
    })
    invalidateCachePattern(PROCEDURES.GET_EMPLOYEES)
    return 'Empleado actualizado correctamente'
  } catch (error) {
    console.error(`Error al actualizar el empleado: ${error}`)

    throw new Error(`Error al actualizar el empleado: ${error}`)
  }
}
