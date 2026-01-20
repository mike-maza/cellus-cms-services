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

  constructor() {
    this.auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL || '',
        private_key:
          process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
        project_id: process.env.GOOGLE_PROJECT_ID || ''
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    })

    this.sheets = google.sheets({ version: 'v4', auth: this.auth })
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
