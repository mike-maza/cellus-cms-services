import type { Response } from 'express'

// Utilitys
import { getDate, validarFechaEspecifica } from '~/utils/dates'
import {
  generateAuthorization,
  generateUniqueId,
  generatePassword
} from '~/utils/generateUniqueId'
import { delay } from '~/utils/delay'
import { dictMonth, generateNoBoleta } from '~/utils/generateNoBoleta'
import { generateDocOfBadPayments } from '~/utils/generateDoc'
import { GoogleSheetsService } from '~/utils/connectGoogleSheet'
import { addTicket } from '~/utils/tickets'

import { SheetConfig } from '~/types'
import { SheetAnalyzerService } from '../sheetAnalyzerService'
import { insertOrUpdateBoletaDB } from '~/database/boletasDB'
import { createEmployee } from '~/database/employeeDB'

// Función auxiliar mejorada
const getRowValue = (row: any, headers: string[], index: number): string => {
  const headerName = headers[index]
  return row[headerName ?? ''] || row[index] || ''
}

// Utilidades para normalizar y validar correos electrónicos
const normalizeEmail = (value: any) =>
  String(value ?? '')
    .trim()
    .toLowerCase()

const EMAIL_HEADER_CANDIDATES = [
  'correo',
  'correo electrónico',
  'correo electronico',
  'email',
  'e-mail',
  'mail'
]

const findEmailHeader = (headers: any[]) => {
  const lower = headers.map(h => String(h).trim().toLowerCase())
  for (const candidate of EMAIL_HEADER_CANDIDATES) {
    const idx = lower.findIndex(h => h === candidate)
    if (idx !== -1) return headers[idx]
  }
  const idxPartial = lower.findIndex(
    h => h.includes('correo') || h.includes('email') || h.includes('mail')
  )
  return idxPartial !== -1 ? headers[idxPartial] : null
}

export const googleSheetsPayments = async (
  spreadsheetId: string,
  sheetName: string,
  username: string,
  onProgress?: (evt: any) => void
) => {
  try {
    const range = `${sheetName.trim()}!A1:ZZ`
    const sheetService = new GoogleSheetsService()
    const sheetAnalyzer = new SheetAnalyzerService()
    const paymentHistory: any[] = []
    const badPayments: any[] = []

    const fecha = getDate(sheetName)

    const config: SheetConfig = {
      spreadsheetId,
      range
    }

    // Leer los datos de la hoja de cálculo
    const sheetData = await sheetService.readSheet(config)

    // console.log(sheetData[1])

    if (!sheetData || sheetData.length === 0) {
      console.log('No se encontraron datos en la hoja especificada')
      //   return res.status(404).json({
      //     success: false,
      //     message: 'No se encontraron datos en la hoja especificada',
      //     data: []
      //   })
    }

    // Procesar los datos de la hoja
    const headers = sheetData[0] // Primera fila como encabezados
    const rows = sheetData.slice(1) // Resto de filas como datos

    // Analizar la estructura de la hoja
    const structure = sheetAnalyzer.analyzeStructure(headers)

    // console.log(sheetData[88])

    // Filtrar y validar datos según el tipo de planilla
    const searchDate = sheetName.includes('Aguinaldo')
      ? ['Diciembre', '14', String(new Date().getFullYear())]
      : sheetName.includes('Bono Productividad')
      ? sheetName.split(' ').slice(2)
      : sheetName.split(' ')

    // 4. Template base para pagos
    const basePayment = {
      SheetName: sheetName,
      PaymentIndicator: 'biweekly-payment',
      PayDay: fecha,
      DAY: searchDate[1],
      MONTH: dictMonth[searchDate[0] || ''],
      YEAR: searchDate[2],
      CreatedDateInvoice: new Date(),
      UpdatedDateInvoice: new Date(),
      UserWhoCreates: username
    }

    // 5. Procesadores específicos por tipo de planilla
    const paymentProcessors = {
      'Bonificacion Productividad Vendedor': {
        checkIndex: 19,
        paymentIndicator: 'productivityBonus',
        processPayment: (payment: any, row: any) => {
          payment.CodEmployee = getRowValue(row, headers, 0)
          payment.FullName = getRowValue(row, headers, 1)
          payment.Billing = getRowValue(row, headers, 2)
          payment.NoBoleta = generateNoBoleta(payment.CodEmployee, sheetName)
          // ... resto de campos específicos
          payment.Total = getRowValue(row, headers, 19)
        }
      },
      'Bono Productividad': {
        checkIndex: 2,
        paymentIndicator: 'productivityBonusPayments',
        processPayment: (payment: any, row: any) => {
          payment.CodEmployee = getRowValue(row, headers, 0)
          payment.FullName = getRowValue(row, headers, 1)
          payment.NoBoleta = generateNoBoleta(payment.CodEmployee, sheetName)
          payment.Total = getRowValue(row, headers, 2)
        }
      },
      'Bono 14': {
        checkIndex: 3,
        paymentIndicator: 'bonus-14-payment',
        processPayment: (payment: any, row: any) => {
          payment.CodEmployee = getRowValue(row, headers, 0)
          payment.FullName = getRowValue(row, headers, 1)
          payment.AmountDays = getRowValue(row, headers, 2)
          payment.Bonus14 = getRowValue(row, headers, 3)
          payment.Total = getRowValue(row, headers, 3)
        }
      },
      Aguinaldo: {
        checkIndex: 3,
        paymentIndicator: 'aguinaldo-payment',
        processPayment: (payment: any, row: any) => {
          payment.CodEmployee = getRowValue(row, headers, 0)
          payment.FullName = getRowValue(row, headers, 1)
          payment.AmountDays = getRowValue(row, headers, 2)
          payment.Total = getRowValue(row, headers, 3)
        }
      }
    }

    // 6. Procesador regular para planillas quincenales
    const processRegularPayment = (payment: any, row: any) => {
      payment.CodEmployee = getRowValue(row, headers, 0)
      payment.FullName = getRowValue(row, headers, 1)
      payment.AmountDays = getRowValue(row, headers, 2)
      payment.BiweeklyAdvance = getRowValue(row, headers, 3)
      payment.NoBoleta = generateNoBoleta(payment.CodEmployee, sheetName)
      payment.TotalOvertime = getRowValue(row, headers, 4)
      payment.Bonus = getRowValue(row, headers, 5)
      payment.Bonus79 = getRowValue(row, headers, 6)
      payment.TotalBiweeklyToPay = getRowValue(row, headers, 7)

      // Las deducciones dinámicas se extraen automáticamente
      // NO las mapeamos manualmente

      payment.TotalDeductions = getRowValue(
        row,
        headers,
        (
          structure.deductionColumns[structure.deductionColumns.length - 1] ?? {
            index: 15
          }
        )?.index + 1 || 15
      )
      payment.Total = getRowValue(
        row,
        headers,
        (
          structure.deductionColumns[structure.deductionColumns.length - 1] ?? {
            index: 15
          }
        )?.index + 2 || 16
      )
      payment.Accreditation1 = getRowValue(
        row,
        headers,
        (
          structure.deductionColumns[structure.deductionColumns.length - 1] ?? {
            index: 15
          }
        )?.index + 3 || 17
      )
      payment.Accreditation2 = getRowValue(
        row,
        headers,
        (
          structure.deductionColumns[structure.deductionColumns.length - 1] ?? {
            index: 15
          }
        )?.index + 4 || 18
      )
      payment.Comments = getRowValue(
        row,
        headers,
        (
          structure.deductionColumns[structure.deductionColumns.length - 1] ?? {
            index: 15
          }
        )?.index + 5 || 19
      )
    }

    // 7. Procesar cada fila
    console.log(`⚙️ Procesando ${rows.length} filas...`)

    for (const [index, row] of rows.entries()) {
      // Crear pago actual
      const currentPayment = {
        ...basePayment,
        CodEmployee: '',
        FullName: '',
        NoBoleta: generateNoBoleta(row[0], sheetName),
        UiAuthorization: generateAuthorization(),
        Comments: '',
        // TotalDeductions: '0',
        Total: '0'
      }

      // Buscar procesador específico
      let processor = null
      for (const [key, config] of Object.entries(paymentProcessors)) {
        if (sheetName.includes(key)) {
          processor = config
          break
        }
      }

      // Verificar si es un pago válido
      const checkIndex = processor ? processor.checkIndex : 16
      const totalValue = getRowValue(row, headers, checkIndex)
      const isValidPayment = String(totalValue ?? '').trim() !== ''

      if (!isValidPayment) {
        badPayments.push({ ...row })
        continue
      }

      // Procesar según tipo
      if (processor) {
        currentPayment.PaymentIndicator = processor.paymentIndicator
        processor.processPayment(currentPayment, row)
      } else {
        processRegularPayment(currentPayment, row)
      }

      // ⭐ EXTRAER DEDUCCIONES DINÁMICAS
      ;(currentPayment as any).deducciones = sheetAnalyzer.extractDeductions(
        row,
        structure,
        headers
      )

      // console.log(
      //   `💰 Pago procesado: ${currentPayment.FullName} - ${currentPayment.deducciones.length} deducciones`
      // )

      currentPayment.NoBoleta = generateNoBoleta(
        currentPayment.CodEmployee,
        sheetName
      )

      /*const result = await insertOrUpdateBoletaDB(currentPayment as any)

      if (result?.success) {
        const rowNumber = index + 2
        const message =
          result.status === 'existing'
            ? 'Boleta ya registrada'
            : 'Boleta creada exitosamente'
        const type = result.status === 'existing' ? 'updated' : 'created'

        onProgress?.({
          type,
          rowNumber,
          message,
          data: {
            fullName: currentPayment.FullName
          }
        })
      }*/

      paymentHistory.push(currentPayment)
      await delay(100) // 100ms para evitar sobrecargar el servidor
    }

    // 8. Guardar en base de datos
    console.log('💾 Guardando pagos en base de datos...')
    // await dbService.connect();

    // const saveResult = await dbService.savePaymentsBatch(paymentHistory);

    // await dbService.disconnect();

    // 9. Generar reporte de pagos malos
    if (badPayments.length > 0) {
      generateDocOfBadPayments(headers, badPayments, sheetName)
    }

    // 10. Respuesta
    console.log('✅ Procesamiento completado exitosamente')

    return {
      success: true,
      message: 'Pagos procesados correctamente',
      data: paymentHistory,
      badPayments
    }
  } catch (error) {
    console.error('Error al procesar la hoja de cálculo:', error)

    return {
      success: false,
      message: 'Error al procesar los datos de la planilla',
      error: error instanceof Error ? error.message : 'Error desconocido',
      data: []
    }
  }
}

type ProgressEvent = {
  type:
    | 'started'
    | 'created'
    | 'updated'
    | 'invalid_email'
    | 'duplicate_email'
    | 'no_email'
    | 'finished'
    | 'error'
  message?: string
  rowNumber?: number
  email?: string
  data?: any
}

// Mapa de columnas de Google Sheet a campos de base de datos
const EMPLOYEE_COLUMNS = {
  CodEmployee: 'Codigo de empleado',
  FullName: 'Nombres Y Apellidos',
  DischargeDate: 'Fecha De Ingreso',
  LowDate: 'Fecha De Baja',
  Email: 'Correo',
  CorporateNumbers: 'Números Corporativos',
  UserStatus: 'Estatus',
  Rol: 'Rol',
  Position: 'Puesto',
  Cdr: 'CDR',
  Account: 'Cuenta',
  NoAccount: 'No. Cuenta',
  BaseSalary: 'Salario Central',
  // SalarioOccidente: 'Salario Occidente', // No hay campo directo en DB flat structure, concatenar si es necesario?
  TotalVacations: 'Total de Vacaciones',
  VacationDeadline: 'Corte Vacaciones',
  SaturdaysAndSundays: 'Sabados y Domingos',
  ImmediateBoss: 'Jefe Inmediato',
  Dpi: 'DPI',
  Igss: 'IGSS',
  Nit: 'NIT',
  Company: 'Empresa',
  Level: 'Nivel'
}

export const googleSheetsClients = async (
  spreadsheetId: string,
  sheetName: string,
  username: string,
  onProgress?: (evt: ProgressEvent) => void
) => {
  try {
    const isValidEmail = (email: string) => {
      const normalized = normalizeEmail(email)
      // Debe contener '@' y terminar con un TLD válido (ej. .gt, .net, .es, .com)
      const basicPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i
      return normalized.length > 0 && basicPattern.test(normalized)
    }

    // Distancia de Levenshtein para comparar nombres de proveedores
    const stringDistance = (
      a: string | undefined,
      b: string | undefined
    ): number => {
      const s1 = (a ?? '').toLowerCase()
      const s2 = (b ?? '').toLowerCase()
      let prev: number[] = Array(s2.length + 1).fill(0)
      for (let j = 0; j <= s2.length; j++) prev[j] = j
      for (let i = 1; i <= s1.length; i++) {
        const curr: number[] = Array(s2.length + 1).fill(0)
        curr[0] = i
        for (let j = 1; j <= s2.length; j++) {
          const cost = s1.charAt(i - 1) === s2.charAt(j - 1) ? 0 : 1
          const del = prev[j]! + 1
          const ins = curr[j - 1]! + 1
          const sub = prev[j - 1]! + cost
          curr[j] = Math.min(del, ins, sub)
        }
        prev = curr
      }
      return prev[s2.length]!
    }

    // Detecta transposición simple (dos letras adyacentes invertidas)
    const isTransposition = (a: string | undefined, b: string | undefined) => {
      const aSafe = a ?? ''
      const bSafe = b ?? ''
      if (aSafe.length !== bSafe.length) return false
      const diffs: number[] = []
      for (let k = 0; k < aSafe.length; k++) {
        if (aSafe.charAt(k).toLowerCase() !== bSafe.charAt(k).toLowerCase())
          diffs.push(k)
        if (diffs.length > 2) return false
      }
      if (diffs.length !== 2) return false
      const i = diffs[0]
      const j = diffs[1]
      if (i === undefined || j === undefined) return false
      return (
        j === i + 1 &&
        aSafe.charAt(i).toLowerCase() === bSafe.charAt(j).toLowerCase() &&
        aSafe.charAt(j).toLowerCase() === bSafe.charAt(i).toLowerCase()
      )
    }

    // Verificación de ortografía de proveedores comunes (gmail, hotmail, outlook, etc.)
    const checkProviderSpelling = (email: string) => {
      const domainPart = email.split('@')[1] || ''
      const provider = domainPart.split('.')[0] || ''
      const knownProviders = ['gmail', 'hotmail', 'outlook', 'yahoo', 'icloud']
      if (!provider || knownProviders.includes(provider)) return null
      let bestExpected: string | null = null
      let bestDist: number | undefined = undefined
      const providerFirst = provider.charAt(0).toLowerCase()
      for (const expected of knownProviders) {
        const dist: number = stringDistance(provider, expected)
        const transposed = isTransposition(provider, expected)
        const expectedFirst = expected.charAt(0).toLowerCase()
        const closeEnough =
          dist <= 1 || transposed || (dist <= 2 && provider.length >= 5)
        if (closeEnough && providerFirst === expectedFirst) {
          if (bestDist == null || dist < (bestDist as number)) {
            bestExpected = expected
            bestDist = dist
          }
        }
      }
      return bestExpected ? { found: provider, expected: bestExpected } : null
    }

    const NAME_HEADER_CANDIDATES = [
      'nombre',
      'nombres',
      'nombre completo',
      'full name',
      'fullname',
      'name',
      'cliente',
      'usuario'
    ]
    const findNameHeader = (headers: any[]) => {
      const lower = headers.map(h => String(h).trim().toLowerCase())
      for (const candidate of NAME_HEADER_CANDIDATES) {
        const idx = lower.findIndex(h => h === candidate)
        if (idx !== -1) return headers[idx]
      }
      const idxPartial = lower.findIndex(
        h => h.includes('nombre') || h.includes('name') || h.includes('cliente')
      )
      return idxPartial !== -1 ? headers[idxPartial] : null
    }

    const range = `${sheetName.trim()}!A1:ZZ`
    const sheetService = new GoogleSheetsService()

    let columns: string[] = []

    const config: SheetConfig = {
      spreadsheetId,
      range
    }

    // Leer los datos de la hoja de cálculo
    const sheetData = await sheetService.readSheet(config)

    if (!sheetData || sheetData.length === 0) {
      console.log('No se encontraron datos en la hoja especificada')
      onProgress?.({
        type: 'error',
        message: 'No se encontraron datos en la hoja especificada'
      })
      return {
        success: false,
        message: 'No se encontraron datos en la hoja de cálculo',
        data: []
      }
    }

    // Procesar los datos de la hoja
    const headers = sheetData[0] // Primera fila como encabezados
    const rows = sheetData.slice(1) // Resto de filas como datos

    // Intentar localizar el encabezado del correo y nombre Si existe
    const emailHeaderName = findEmailHeader(headers)
    const nameHeaderName = findNameHeader(headers)

    // Mapear los datos con información adicional
    const processedData = rows.map((row, index) => {
      const rowData: any = {}
      headers.forEach((header: string, i: number) => {
        rowData[header] = row[i]
      })

      return {
        ...rowData,
        rowNumber: index + 2, // +2 porque empezamos en la fila 2 (después de headers)
        sheetName: sheetName,
        processedDate: new Date().toISOString()
      }
    })

    // Emitir evento de inicio
    onProgress?.({
      type: 'started',
      message: 'Procesando filas',
      data: { sheetName }
    })

    const result = {
      success: true,
      sheetName,
      processedBy: username,
      processedAt: new Date().toISOString(),
      totalRows: processedData.length,
      invalidEmails: [] as { rowNumber: number; email: string }[],
      duplicateEmails: [] as {
        rowNumber: number
        email: string
        firstRowNumber: number
      }[],
      noEmails: [] as { rowNumber: number }[],

      created: [] as { rowNumber: number; email?: string; fullName?: string }[]
    }

    const seenEmails = new Map<string, number>()

    // Validar correos por fila y normalizar el valor; detectar duplicados
    if (emailHeaderName) {
      for (const row of processedData) {
        const rawEmail = row[emailHeaderName]
        const normalizedEmail = normalizeEmail(rawEmail)
        row.Email = normalizedEmail

        // Sin correo
        if (!normalizedEmail) {
          result.noEmails.push({ rowNumber: row.rowNumber })
          onProgress?.({ type: 'no_email', rowNumber: row.rowNumber })
          continue
        }

        // Correo inválido
        if (!isValidEmail(normalizedEmail)) {
          result.invalidEmails.push({
            rowNumber: row.rowNumber,
            email: normalizedEmail
          })
          onProgress?.({
            type: 'invalid_email',
            rowNumber: row.rowNumber,
            email: normalizedEmail
          })
          continue
        }

        // Duplicados
        // Duplicados
        if (seenEmails.has(normalizedEmail)) {
          const firstRow = seenEmails.get(normalizedEmail)!
          result.duplicateEmails.push({
            rowNumber: row.rowNumber,
            email: normalizedEmail,
            firstRowNumber: firstRow
          })
          onProgress?.({
            type: 'duplicate_email',
            rowNumber: row.rowNumber,
            email: normalizedEmail
          })
        } else {
          seenEmails.set(normalizedEmail, row.rowNumber)

          let fullName = 'Usuario'
          if (nameHeaderName) {
            fullName = row[nameHeaderName] || 'Usuario'
          }

          // Intentar crear el empleado en la base de datos
          const generatedPassword = generatePassword()
          try {
            // Mapeo dinámico usando la configuración
            const employeeData = {
              CodEmployee: row[EMPLOYEE_COLUMNS.CodEmployee] || '',
              FullName:
                row[EMPLOYEE_COLUMNS.FullName] ||
                row[nameHeaderName || ''] ||
                fullName,
              Email: normalizedEmail, // Priorizamos el email normalizado
              Password: generatedPassword,
              DischargeDate:
                row[EMPLOYEE_COLUMNS.DischargeDate] || new Date().toISOString(),
              LowDate: row[EMPLOYEE_COLUMNS.LowDate] || '',
              Cdr: row[EMPLOYEE_COLUMNS.Cdr] || '',
              FirstTimeOfSite: '1',
              Rol: row[EMPLOYEE_COLUMNS.Rol] || 'Colaborador',
              Position: row[EMPLOYEE_COLUMNS.Position] || '',
              Account: row[EMPLOYEE_COLUMNS.Account] || '',
              NoAccount: row[EMPLOYEE_COLUMNS.NoAccount] || '',
              NoAuthorization: generateUniqueId(),
              BaseSalary: row[EMPLOYEE_COLUMNS.BaseSalary] || '',
              TotalVacations: row[EMPLOYEE_COLUMNS.TotalVacations] || '',
              SaturdaysAndSundays:
                row[EMPLOYEE_COLUMNS.SaturdaysAndSundays] || '',
              ImmediateBoss: row[EMPLOYEE_COLUMNS.ImmediateBoss] || '',
              Dpi: row[EMPLOYEE_COLUMNS.Dpi] || '',
              Igss: row[EMPLOYEE_COLUMNS.Igss] || '',
              Nit: row[EMPLOYEE_COLUMNS.Nit] || '',
              UserStatus: row[EMPLOYEE_COLUMNS.UserStatus] || 'Activo',
              VacationDeadline: row[EMPLOYEE_COLUMNS.VacationDeadline] || '',
              Company: row[EMPLOYEE_COLUMNS.Company] || 'Cellus',
              Level: row[EMPLOYEE_COLUMNS.Level] || '',
              UserWhoCreates: username,
              UserWhoUpdates: username,
              CorporateNumbers: row[EMPLOYEE_COLUMNS.CorporateNumbers] || ''
            }

            console.log(employeeData)

            // Solo intentamos crear si tenemos un código de empleado válido
            if (employeeData.CodEmployee) {
              await createEmployee(employeeData)

              result.created.push({
                rowNumber: row.rowNumber,
                email: normalizedEmail,
                fullName
              })

              onProgress?.({
                type: 'created',
                rowNumber: row.rowNumber,
                email: normalizedEmail,
                data: {
                  fullName,
                  username: row['Codigo de empleado'],
                  password: generatedPassword
                }
              })
            }
          } catch (error) {
            console.error(
              `Error al auto-crear empleado ${normalizedEmail}:`,
              error
            )
          }

          const providerIssue = checkProviderSpelling(normalizedEmail)
          if (providerIssue) {
            console.warn(
              `Posible error en proveedor "${providerIssue.found}" en fila ${row.rowNumber}. ¿Quisiste decir "${providerIssue.expected}"?`
            )
          }
        }
      }
    } else {
      // Sin encabezado de correo: marcar todas como sin correo
      for (const row of processedData) {
        result.noEmails.push({ rowNumber: row.rowNumber })
        onProgress?.({ type: 'no_email', rowNumber: row.rowNumber })
      }
    }

    // Terminar con resumen
    onProgress?.({ type: 'finished', data: result })
    return result
  } catch (err) {
    console.error(err)
    onProgress?.({
      type: 'error',
      message: err instanceof Error ? err.message : 'Error desconocido'
    })
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Error desconocido'
    }
  }
}
