import { Storage } from '@google-cloud/storage'
import { configWithCreds } from '~/utils/credentialsGoogle/Cellus'

const storage = new Storage({
  projectId: configWithCreds.projectId,
  credentials: {
    client_email: configWithCreds.clientEmail || '',
    private_key: (configWithCreds.privateKey || '').replace(/\\n/g, '\n')
  }
})

const bucketName = process.env.BUCKET_NAME || 'paymentscellus'
const bucket = storage.bucket(bucketName)

export const gcsService = {
  listFiles: async (prefix: string) => {
    // Buscamos dentro de la carpeta cod/DPIS/
    const fullPrefix = `${prefix}/DPIS/`
    const [files] = await bucket.getFiles({
      prefix: fullPrefix
    })

    const filesWithSignedUrls = await Promise.all(
      files.map(async file => {
        const [url] = await file.getSignedUrl({
          version: 'v4',
          action: 'read',
          expires: Date.now() + 5 * 60 * 1000 // 5 minutos
        })

        return {
          name: file.name,
          url,
          metadata: file.metadata
        }
      })
    )

    return filesWithSignedUrls
  },

  /**
   * Elimina un archivo específico asegurando que esté dentro de DPIS
   */
  deleteFile: async (fileName: string) => {
    // fileName ya debería venir con la ruta completa desde el front si se obtiene de listFiles
    await bucket.file(fileName).delete()
    return true
  }
}
