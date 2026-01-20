import { CloudStorageConfig } from '~/types'

export const configWithCreds: CloudStorageConfig = {
  projectId: process.env.PROJECT_ID_GOOGLE ?? '',
  keyFilename: '',
  clientEmail: process.env.CLIENT_EMAIL_GOOGLE ?? '',
  privateKey: process.env.PRIVATE_KEY_GOOGLE ?? ''
}
