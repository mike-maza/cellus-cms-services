import { format } from '@formkit/tempo'
import { dictMonth } from '~/utils/generateNoBoleta'

const DATEREGEX =
  /^(Enero|Febrero|Marzo|Abril|Mayo|Junio|Julio|Agosto|Septiembre|Octubre|Noviembre|Diciembre)\s\d{1,2}\s\d{4}$/i
export const MONTHS = new Set([
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
])

/**
 * Time
 * @returns
 */
export const getTime = () => {
  return new Date().getTime()
}

/**
 * Fecha
 * @param sheetName
 * @returns
 */
export const getDate = (sheetName?: string) => {
  const searchDate = sheetName?.split(' ')

  if (sheetName?.includes('Aguinaldo')) {
    const day = 14
    const month = '12'
    // @ts-ignore
    const year = searchDate[1]

    return `${day}/${month}/${year}`
  }

  if (sheetName?.includes('Bono 14')) {
    const day = 14
    const month = '07'
    // @ts-ignore
    const year = searchDate[2]

    return `${day}/${month}/${year}`
  }

  if (sheetName?.includes('Bonificacion Productividad Vendedor')) {
    // @ts-ignore
    const day = searchDate[4]
    // @ts-ignore
    const month = dictMonth[searchDate[3]]
    // @ts-ignore
    const year = searchDate[5]

    return format(new Date(`${month}, ${day}, ${year}`), 'DD/MM/YYYY')
  }

  if (sheetName?.includes('Bono Productividad')) {
    // @ts-ignore
    const day = searchDate[3]
    // @ts-ignore
    const month = dictMonth[searchDate[2]]
    // @ts-ignore
    const year = searchDate[4]

    return format(new Date(`${month}, ${day}, ${year}`), 'DD/MM/YYYY')
  }

  if (searchDate) {
    const day = searchDate[1]
    // @ts-ignore
    const month = dictMonth[searchDate[0]]
    const year = searchDate[2]

    return format(new Date(`${month}, ${day}, ${year}`), 'DD/MM/YYYY')
  }

  return format(new Date(), 'DD/MM/YYYY')
}

//
/**
 * Horas
 * @returns
 */
export const getHours = () => {
  return format(new Date(), 'HH:mm:ss')
}

/**
 * Horas boletas
 * @returns
 */
export const getHoursForBoleta = () => {
  return format(new Date(), 'HHmmss')
}

// Dias
export const day = () => {
  return format(new Date(), 'DD')
}

// Mes
export const month = () => {
  return format(new Date(), 'MM')
}

// Año
export const year = () => {
  return format(new Date(), 'YYYY')
}

export const validateDate = (dateStr: string): boolean => {
  // Dividir la cadena y validar longitud
  const [month, dayStr, yearStr] = dateStr.split(' ')
  if (!month || !dayStr) return false

  // Validar mes
  if (!MONTHS.has(month.toLowerCase())) return false

  // Convertir día y año a número
  const day = Number(dayStr)

  // Validar días permitidos: 15 y 30 para todos los meses excepto febrero, y 28 solo para febrero
  if (month.toLowerCase() === 'febrero') {
    if (![15, 28].includes(day)) return true
  } else {
    if (![15, 30].includes(day)) return true
  }

  return false
}

export function validarFechaEspecifica(fechaStr: string): boolean {
  // Mapear nombres de meses a números
  const meses: { [key: string]: number } = {
    enero: 0,
    febrero: 1,
    marzo: 2,
    abril: 3,
    mayo: 4,
    junio: 5,
    julio: 6,
    agosto: 7,
    septiembre: 8,
    octubre: 9,
    noviembre: 10,
    diciembre: 11
  }

  // Dividir la cadena en partes
  const partes = fechaStr.toLowerCase().split(' ')
  if (partes.length !== 3) {
    // throw new Error("Formato de fecha incorrecto. Debe ser 'Mes Día Año'.");
    return false
  }

  const [mesStr, diaStr, anioStr] = partes

  // Obtener el número del mes
  const mes = meses[mesStr || '']
  if (mes === undefined) {
    throw new Error('Nombre del mes inválido.')
  }

  // Convertir día y año a números
  const dia = parseInt(diaStr || '', 10)
  const anio = parseInt(anioStr || '', 10)

  // Crear un objeto Date
  const fecha = new Date(anio, mes, dia)

  // Verificar si la fecha es válida
  if (
    fecha.getFullYear() !== anio ||
    fecha.getMonth() !== mes ||
    fecha.getDate() !== dia
  ) {
    throw new Error('Fecha inválida.')
  }

  // Validar si es el día 15 de cualquier mes
  if (dia === 15) {
    return true
  }

  // Validar si es el día 30 de cualquier mes, excepto febrero
  if (dia === 30 && mes !== 1) {
    // Febrero es el mes 1 (enero es 0)
    return true
  }

  // Validar si es el día 28 de febrero
  if (dia === 28 && mes === 1) {
    return true
  }

  // Si no cumple con ninguna de las condiciones anteriores, retornar false
  return false
}
