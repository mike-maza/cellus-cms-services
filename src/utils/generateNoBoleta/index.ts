import { day, month, year, getHoursForBoleta } from '~/utils/dates'

export const dictMonth: Record<string, string> = {
  Enero: '01',
  Febrero: '02',
  Marzo: '03',
  Abril: '04',
  Mayo: '05',
  Junio: '06',
  Julio: '07',
  Bono: '07',
  Agosto: '08',
  Septiembre: '09',
  Octubre: '10',
  Noviembre: '11',
  Diciembre: '12',
  Aguinaldo: '12'
}

export const dictReverseMonth: Record<string, string> = {
  '01': 'Enero',
  '02': 'Febrero',
  '03': 'Marzo',
  '04': 'Abril',
  '05': 'Mayo',
  '06': 'Junio',
  '07': 'Julio',
  '08': 'Agosto',
  '09': 'Septiembre',
  '10': 'Octubre',
  '11': 'Noviembre',
  '12': 'Diciembre'
}

function textoANumerosAlfabetoStringLimitado(texto: string): string {
  const numeros: number[] = []

  for (const caracter of texto.toLowerCase()) {
    // Convertimos a minúsculas
    if (caracter >= 'a' && caracter <= 'z') {
      // Solo procesamos letras
      const numero = caracter.charCodeAt(0) - 'a'.charCodeAt(0) + 1
      numeros.push(numero)
    }
  }

  let resultado = numeros.join('') // Unimos los números con comas

  // Limitamos el resultado a 10 caracteres
  return resultado.slice(0, 5)
}

export const generateNoBoleta = (codEmployee: string, sheetName: string) => {
  const SPLIT_SHEETNAME = sheetName.split(' ') ?? ['', '', '']
  let COD_EMPLOYEE = codEmployee
  let DAY = SPLIT_SHEETNAME[1] ?? day()
  let MONTH = SPLIT_SHEETNAME[0]
    ? dictMonth[SPLIT_SHEETNAME[0] as keyof typeof dictMonth] ?? month()
    : month()
  let YEAR = SPLIT_SHEETNAME[2] ?? year()
  let TEXT = ''

  if (codEmployee.includes('CELL')) {
    COD_EMPLOYEE = codEmployee.split('-')[1]?.trim() ?? ''
    TEXT = 'CELL'
  }

  if (sheetName.includes('Super')) {
    MONTH = SPLIT_SHEETNAME[1]
      ? dictMonth[SPLIT_SHEETNAME[1] as keyof typeof dictMonth] ?? month()
      : month()
    DAY = SPLIT_SHEETNAME[2] ?? day()
    TEXT = 'Super'
  }

  if (sheetName.includes('Bono 14')) {
    MONTH = '07'
    DAY = day()
    TEXT = 'Bono 14'
  }

  if (sheetName.includes('Bonificacion Productividad Vendedor')) {
    MONTH = SPLIT_SHEETNAME[3]
      ? dictMonth[SPLIT_SHEETNAME[3] as keyof typeof dictMonth] ?? month()
      : month()
    DAY = SPLIT_SHEETNAME[4] ?? day()
    YEAR = SPLIT_SHEETNAME[5] ?? year()
    TEXT = 'Bonificacion Productividad Vendedor'
  }

  if (sheetName.includes('Bono Productividad')) {
    MONTH = SPLIT_SHEETNAME[2]
      ? dictMonth[SPLIT_SHEETNAME[2] as keyof typeof dictMonth] ?? month()
      : month()
    DAY = SPLIT_SHEETNAME[3] ?? day()
    YEAR = SPLIT_SHEETNAME[4] ?? year()
    TEXT = 'Bono Productividad'
  }

  if (sheetName.includes('Aguinaldo')) {
    MONTH = '12'
    DAY = day()
    TEXT = 'Aguinaldo'
  }

  return `${YEAR}${MONTH}${DAY}${textoANumerosAlfabetoStringLimitado(
    TEXT
  )}${getHoursForBoleta()}${COD_EMPLOYEE}`
}
