interface SheetStructure {
  fixedColumnsStart: string[] // Columnas fijas al inicio (nombre, salario, etc)
  fixedColumnsEnd: string[] // Columnas fijas al final
  deductionColumns: Array<{
    name: string
    index: number
  }>
}

export interface DeduccionDinamica {
  tipo: string
  monto: number
  observaciones?: string
}

export class SheetAnalyzerService {
  /**
   * Prefijos válidos para identificar deducciones
   */
  private readonly deductionPrefixes = [
    'D ', // "D Embargo de salario"
    'DED ', // "DED ISR"
    'DESC ', // "DESC IGSS"
    'DEDUCCION ' // "DEDUCCION Préstamo"
  ]

  /**
   * Columnas que siempre están fijas al inicio (antes de deducciones)
   */
  private readonly fixedStartColumns = [
    'Codigo Empleado',
    'Nombres y Apellidos',
    'Cantidad/Dias',
    'Sueldo Orinario',
    'Sueldo Extraordinario',
    'Bonificación 37-2001',
    'Bonificación 79-89',
    'Total Devengado'
  ]

  /**
   * Columnas que siempre están fijas al final (después de deducciones)
   */
  private readonly fixedEndColumns = [
    'Total deducciones',
    'Total a recibir',
    'Acreditación #1',
    'Acreditación #2',
    'Comentarios'
  ]

  /**
   * Verifica si una columna es una deducción basada en su prefijo
   */
  private isDeductionColumn(header: string): boolean {
    const trimmed = header.trim()

    // Verificar si comienza con alguno de los prefijos
    return this.deductionPrefixes.some(prefix => trimmed.startsWith(prefix))
  }

  /**
   * Limpia el nombre de la deducción removiendo el prefijo
   */
  cleanDeductionName(header: string): string {
    let cleaned = header.trim()

    // Remover el prefijo si existe
    for (const prefix of this.deductionPrefixes) {
      if (cleaned.startsWith(prefix)) {
        cleaned = cleaned.substring(prefix.length).trim()
        break
      }
    }

    return cleaned
  }

  /**
   * Analiza la estructura del sheet e identifica columnas dinámicas
   */
  analyzeStructure(headers: string[]): SheetStructure {
    const normalizedHeaders = headers.map(h =>
      String(h || '')
        .trim()
        .toLowerCase()
    )

    // Encontrar el último índice de columnas fijas de inicio
    let lastStartIndex = -1
    for (let i = 0; i < normalizedHeaders.length; i++) {
      if (this.fixedStartColumns.includes(normalizedHeaders[i] || '')) {
        lastStartIndex = Math.max(lastStartIndex, i)
      }
    }

    // Encontrar el primer índice de columnas fijas de final
    let firstEndIndex = normalizedHeaders.length
    for (let i = 0; i < normalizedHeaders.length; i++) {
      if (this.fixedEndColumns.includes(normalizedHeaders[i] || '')) {
        firstEndIndex = Math.min(firstEndIndex, i)
        break
      }
    }

    // Identificar deducciones por prefijo
    const deductionColumns: Array<{
      name: string
      index: number
      cleanName: string
    }> = []

    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]
      const trimmed = String(header || '').trim()

      // Si está entre las columnas fijas, verificar el prefijo
      if (i > lastStartIndex && i < firstEndIndex) {
        if (this.isDeductionColumn(trimmed)) {
          deductionColumns.push({
            name: trimmed,
            index: i,
            cleanName: this.cleanDeductionName(trimmed)
          })
        }
      }
    }

    return {
      fixedColumnsStart: this.fixedStartColumns,
      fixedColumnsEnd: this.fixedEndColumns,
      deductionColumns
    }
  }

  /**
   * Extrae las deducciones de una fila según la estructura
   */
  extractDeductions(
    row: any,
    structure: SheetStructure,
    headers: string[]
  ): DeduccionDinamica[] {
    const deducciones: DeduccionDinamica[] = []

    for (const col of structure.deductionColumns) {
      // Intentar obtener el valor de diferentes formas
      let rawValue =
        row[col.index] || row[headers[col.index] ?? ''] || row[col.name]

      // Limpiar y parsear el valor
      const stringValue = String(rawValue || '0')
        .replace(/[,Q\s]/g, '') // Remover comas, Q, y espacios
        .replace(/[^\d.-]/g, '') // Solo números, punto y signo negativo

      const monto = parseFloat(stringValue)

      // Solo agregar si tiene un valor válido mayor a 0
      if (!isNaN(monto) && monto > 0) {
        deducciones.push({
          // @ts-ignore
          tipo: col.cleanName, // Usar el nombre limpio sin prefijo
          monto: monto,
          observaciones: `Columna: "${col.name}" (índice ${col.index + 1})`
        })
      } else if (!isNaN(monto) && monto < 0) {
        // Si es negativo, también lo guardamos (podría ser un ajuste)
        deducciones.push({
          // @ts-ignore
          tipo: col.cleanName,
          monto: Math.abs(monto), // Guardar como positivo
          observaciones: `Ajuste negativo de columna: "${col.name}"`
        })
      }
    }

    return deducciones
  }

  /**
   * Valida que las deducciones tengan el formato correcto
   */
  validateDeductionHeaders(headers: string[]): {
    valid: boolean
    warnings: string[]
    suggestions: string[]
  } {
    const warnings: string[] = []
    const suggestions: string[] = []

    // Buscar columnas que parecen deducciones pero no tienen prefijo
    const suspiciousColumns = [
      'igss',
      'isr',
      'prestamo',
      'embargo',
      'anticipo',
      'tsh',
      'banco',
      'judicial',
      'descuento'
    ]

    headers.forEach((header, index) => {
      const normalized = String(header || '')
        .trim()
        .toLowerCase()

      // Si contiene palabras sospechosas pero no tiene prefijo
      const seemsLikeDeduction = suspiciousColumns.some(word =>
        normalized.includes(word)
      )

      const hasPrefix = this.isDeductionColumn(header)

      if (seemsLikeDeduction && !hasPrefix) {
        warnings.push(
          `Columna "${header}" (índice ${
            index + 1
          }) parece ser una deducción pero no tiene prefijo`
        )
        suggestions.push(`Renombrar "${header}" a "D ${header}"`)
      }
    })

    return {
      valid: warnings.length === 0,
      warnings,
      suggestions
    }
  }
}
