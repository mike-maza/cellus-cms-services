import { executeStoredProcedure } from '~/database/connection'
import { PROCEDURES } from '../procedures'

export const getEmployeesDB = async (params?: {
  PageNumber?: number | undefined
  PageSize?: number | undefined
}) => {
  try {
    const get_employees = await executeStoredProcedure(
      PROCEDURES.GET_EMPLOYEES,
      {
        ...(params ? { params } : {}),
        useCache: true,
        cacheTTL: 5 * 60 * 1000 // 5 minutos de caché
      }
    )

    return get_employees
  } catch (error) {
    console.error(`Error al obtener los empleados: ${error}`)

    throw new Error(`Error al obtener los empleados: ${error}`)
  }
}

export const getEmployeeById = async (id: string) => {
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

export const createEmployee = async (data: any) => {
  try {
    await executeStoredProcedure(PROCEDURES.CREATE_EMPLOYEE, { params: data })

    return 'Empleado creado correctamente'
  } catch (error) {
    console.error(`Error al crear el empleado: ${error}`)

    throw new Error(`Error al crear el empleado: ${error}`)
  }
}

export const updateEmployee = async (data: any) => {
  try {
    await executeStoredProcedure(PROCEDURES.UPDATE_EMPLOYEE, { params: data })

    return 'Empleado actualizado correctamente'
  } catch (error) {
    console.error(`Error al actualizar el empleado: ${error}`)

    throw new Error(`Error al actualizar el empleado: ${error}`)
  }
}
