import { google } from 'googleapis'
import {
  type ExternalAccountClientOptions,
  type JWTInput,
  GoogleAuth
} from 'google-auth-library'
import { Storage, Bucket } from '@google-cloud/storage'

import { CloudStorageConfig, SheetConfig } from '~/types'

import { configWithCreds } from '~/utils/credentialsGoogle/Cellus'

interface ImageInfo {
  signedUrl: string
  name: string
}

export class GoogleSheetsService {
  private auth: GoogleAuth
  private sheets: any
  private drive: any

  constructor() {
    const credentials = {
      client_email: process.env.GOOGLE_CLIENT_EMAIL || '',
      private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      project_id: process.env.GOOGLE_PROJECT_ID || ''
    }

    this.auth = new GoogleAuth({
      projectId: credentials.project_id,
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.readonly'
      ]
    })

    this.sheets = google.sheets({ version: 'v4', auth: this.auth })
    this.drive = google.drive({ version: 'v3', auth: this.auth })
  }

  async listSpreadsheets(
    queryTerm?: string,
    categoryTerm?: string
  ): Promise<any[]> {
    try {
      console.log(
        `[GoogleSheetsService] listSpreadsheets - queryTerm: "${queryTerm}", categoryTerm: "${categoryTerm}"`
      )
      let q =
        "mimeType='application/vnd.google-apps.spreadsheet' and trashed = false"

      const conditions: string[] = []

      if (queryTerm) {
        conditions.push(`name contains '${queryTerm}'`)
      }

      if (categoryTerm) {
        const terms = categoryTerm.split(/[ ,]+/).filter(t => t.length > 0)
        if (terms.length > 0) {
          const categoryQuery = terms
            .map(t => `name contains '${t}'`)
            .join(' or ')
          conditions.push(`(${categoryQuery})`)
        }
      }

      if (conditions.length > 0) {
        q += ` and ${conditions.join(' and ')}`
      }

      console.log(`[GoogleSheetsService] listSpreadsheets - q: "${q}"`)

      const response = await this.drive.files.list({
        q,
        fields: 'files(id, name, modifiedTime)',
        pageSize: 50,
        orderBy: 'modifiedTime desc'
      })

      const filesAvailable = response.data.files || []
      console.log(
        `[GoogleSheetsService] listSpreadsheets - Archivos encontrados: ${filesAvailable.length}`
      )

      return filesAvailable
    } catch (err: any) {
      console.error(
        `[GoogleSheetsService] ERROR en listSpreadsheets:`,
        err.message || err
      )
      // Si el error es 403 o 404, podría ser que la API de Drive no esté habilitada o permisos
      throw err
    }
  }

  getServiceAccount(): string {
    return process.env.GOOGLE_CLIENT_EMAIL || 'No configurado'
  }

  async getSheetNames(spreadsheetId: string): Promise<string[]> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId
      })
      return (
        response.data.sheets?.map((s: any) => s.properties?.title || '') || []
      )
    } catch (err) {
      console.error(`Error al obtener nombres de pestañas: ${err}`)
      throw err
    }
  }

  async readSheet(config: SheetConfig): Promise<any[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: config.spreadsheetId,
        range: config.range
      })

      return response.data.values || []
    } catch (err) {
      console.error(`Error al leer la hoja: ${err}`)
      throw err
    }
  }

  /**
   * Encuentra el índice de la fila (1-based) donde una columna específica coincide con un valor.
   * @param spreadsheetId ID de la hoja de cálculo
   * @param sheetName Nombre de la pestaña
   * @param columnName Nombre de la columna header
   * @param value Valor a buscar
   * @returns El número de fila (1-based) o -1 si no se encuentra
   */
  async findRowIndex(
    spreadsheetId: string,
    sheetName: string,
    columnName: string,
    value: string
  ): Promise<number> {
    try {
      const config: SheetConfig = {
        spreadsheetId,
        range: `${sheetName}!A1:ZZ`
      }
      const data = await this.readSheet(config)

      if (!data || data.length === 0) return -1

      const headers = data[0].map((h: string) => h.trim())
      const columnIndex = headers.indexOf(columnName)

      if (columnIndex === -1) {
        console.error(`Columna "${columnName}" no encontrada en la hoja`)
        return -1
      }

      // Buscar en las filas (saltando headers)
      for (let i = 1; i < data.length; i++) {
        const row = data[i]
        // Comparación flexible (trim)
        if (String(row[columnIndex]).trim() === String(value).trim()) {
          return i + 1 // +1 porque los arrays son 0-based pero las sheets son 1-based
        }
      }

      return -1
    } catch (error) {
      console.error('Error buscando fila:', error)
      throw error
    }
  }

  /**
   * Actualiza una celda específica buscando primero la fila y luego la columna
   */
  async updateField(
    spreadsheetId: string,
    sheetName: string,
    searchColumn: string,
    searchValue: string,
    targetColumn: string,
    newValue: string
  ): Promise<boolean> {
    try {
      // 1. Encontrar la fila
      const rowIndex = await this.findRowIndex(
        spreadsheetId,
        sheetName,
        searchColumn,
        searchValue
      )

      if (rowIndex === -1) {
        console.log(
          `No se encontró registro con ${searchColumn}=${searchValue}`
        )
        return false
      }

      // 2. Encontrar la letra de la columna destino
      const config: SheetConfig = {
        spreadsheetId,
        range: `${sheetName}!A1:ZZ1` // Solo leer headers
      }
      const headerData = await this.readSheet(config)
      const headers = headerData[0].map((h: string) => h.trim())
      const targetColIndex = headers.indexOf(targetColumn)

      if (targetColIndex === -1) {
        console.error(`Columna destino "${targetColumn}" no encontrada`)
        return false
      }

      // Convertir índice a letra de columna (0 -> A, 1 -> B, etc.)
      // Nota: Esto funciona para A-Z. Para más columnas se necesita lógica adicional,
      // pero para este caso de uso suele ser suficiente o usar una librería.
      // Una implementación simple para A-Z:
      const colLetter = String.fromCharCode(65 + targetColIndex)

      // Si el índice es mayor a 25 (Z), se necesita lógica para AA, AB, etc.
      // Implementación más robusta de índice a colLetter:
      const getColumnLetter = (colIndex: number) => {
        let temp,
          letter = ''
        while (colIndex >= 0) {
          temp = colIndex % 26
          letter = String.fromCharCode(temp + 65) + letter
          colIndex = Math.floor(colIndex / 26) - 1
        }
        return letter
      }

      const finalColLetter = getColumnLetter(targetColIndex)

      const updateRange = `${sheetName}!${finalColLetter}${rowIndex}`

      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: updateRange,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[newValue]]
        }
      })

      console.log(
        `Actualizado ${targetColumn} a "${newValue}" en fila ${rowIndex}`
      )
      return true
    } catch (error) {
      console.error('Error actualizando campo:', error)
      return false
    }
  }
}

export class CloudStorageService {
  private storage: Storage
  private bucket: Bucket
  private auth: GoogleAuth

  constructor(config: CloudStorageConfig, bucketName: string) {
    // Inicializar autenticación

    // Si se proporcionan clientEmail y privateKey, usar esas credenciales
    this.auth = new GoogleAuth({
      ...(config.clientEmail && config.privateKey
        ? ({
            client_email: config.clientEmail!,
            private_key: config.privateKey
          } as JWTInput)
        : {}),
      // Si no, usar el archivo de credenciales
      keyFile: config.keyFilename,
      projectId: config.projectId,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    })

    this.storage = new Storage({
      projectId: config.projectId,
      authClient: this.auth as any
    })

    this.bucket = this.storage.bucket(bucketName)
  }

  async listFiles(
    options: {
      prefix?: string
      pageSize?: number
      pageToken?: string
    } = {}
  ): Promise<ImageInfo[]> {
    try {
      // @ts-ignore
      const [files] = await this.bucket.getFiles({
        prefix: options.prefix
      })

      const imageFiles = files.filter((file: any) =>
        file.metadata.contentType?.startsWith('image/')
      )

      const imagesInfo: ImageInfo[] = await Promise.all(
        imageFiles.map(async (file: any) => {
          // Obtener metadata del archivo
          const [metadata] = await file.getMetadata()

          return {
            name: file.name
            /*publicUrl,
            contentType: metadata.contentType || 'unknown',
            @ts-ignore
            size: this.formatBytes(parseInt(metadata.size)),
            @ts-ignore
            updated: new Date(metadata.updated).toLocaleString()*/
          }
        })
      )

      return imagesInfo
    } catch (err) {
      console.error(err)

      throw new Error(`Error al listar archivos: ${err}`)
    }
  }

  /**
   * Genera una URL pública para un archivo
   */
  getPublicUrl(fileName: string): string {
    return `https://storage.googleapis.com/${this.bucket.name}/${fileName}`
  }

  /**
   * Genera una URL firmada temporal para un archivo
   */
  async getSignedUrl(
    fileName: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const options = {
        version: 'v4' as const,
        action: 'read' as const,
        expires: Date.now() + expiresIn * 1000
      }

      const [url] = await this.bucket.file(fileName).getSignedUrl(options)
      return url
    } catch (error) {
      throw new Error(`Error generando URL firmada: ${error}`)
    }
  }

  async downloadfile(codEmployee: string): Promise<Buffer | null> {
    try {
      // Descargar el archivo
      const [content] = await this.bucket
        .file(`${codEmployee}/signature/signature.png`)
        .download()
      return content // Retorna el contenido del archivo como un Buffer
    } catch (err) {
      console.error(
        `No se encontró la imagen para el empleado ${codEmployee}:`,
        err
      )
      return null // Retorna null si el archivo no existe o hay un error
    }
  }

  // Eliminar un archivo
  async deleteFile(codEmployee: string): Promise<void> {
    try {
      const cloudStorage = new CloudStorageService(
        configWithCreds,
        process.env.BUCKET_ENV ?? ''
      )

      const files = await cloudStorage.listFiles({
        prefix: `${codEmployee}/DPIS/`
      })

      for (let i = 0; i < files.length; i++) {
        // @ts-ignore
        await this.bucket.file(files[i].name).delete()
      }
    } catch (error) {
      throw new Error(`Error al eliminar archivo: ${error}`)
    }
  }
}
