import crypto from 'crypto'

interface EncryptedData {
  iv: string
  data: string
  tag: string
}

class AdvancedEncryptionService {
  private readonly algorithm = 'aes-256-gcm'
  private readonly secretKey: Buffer

  constructor() {
    if (!process.env.ENCRYPTION_SECRET) {
      throw new Error('ENCRYPTION_SECRET environment variable is required')
    }

    // Usar PBKDF2 para derivar la clave (más seguro)
    this.secretKey = crypto.pbkdf2Sync(
      process.env.ENCRYPTION_SECRET,
      'salt',
      100000, // iteraciones
      32, // key length
      'sha256'
    )
  }

  encrypt(text: string): EncryptedData {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const tag = cipher.getAuthTag()
    return {
      iv: iv.toString('hex'),
      data: encrypted,
      tag: tag.toString('hex')
    }
  }

  decrypt(encryptedData: EncryptedData): string {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.secretKey,
      Buffer.from(encryptedData.iv, 'hex')
    )

    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'))

    let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }

  // Para VARBINARY(MAX) - versión combinada
  encryptToBuffer(text: string): Buffer {
    const encrypted = this.encrypt(text)

    // Convertir todo a Buffer combinado
    const ivBuffer = Buffer.from(encrypted.iv, 'hex')
    const dataBuffer = Buffer.from(encrypted.data, 'hex')
    const tagBuffer = Buffer.from(encrypted.tag, 'hex')

    return Buffer.concat([ivBuffer, dataBuffer, tagBuffer])
  }

  decryptFromBuffer(buffer: Buffer): string {
    if (buffer.length < 32) {
      throw new Error('Buffer is too short for decryption')
    }

    const iv = buffer.subarray(0, 16).toString('hex')
    const tag = buffer.subarray(-16).toString('hex')
    const data = buffer.subarray(16, -16).toString('hex')

    return this.decrypt({ iv, data, tag })
  }

  // Para datos estructurados (como backup codes)
  encryptObject(obj: any): Buffer {
    const jsonString = JSON.stringify(obj)
    return this.encryptToBuffer(jsonString)
  }

  decryptObject<T>(buffer: Buffer): T {
    const jsonString = this.decryptFromBuffer(buffer)
    return JSON.parse(jsonString) as T
  }

  // Legacy decryption for 2FA migration
  decryptTwoFactorLegacy(encryptedData: Buffer): string {
    const ALGORITHM = 'aes-256-cbc'
    const IV_LENGTH = 16
    const ENCRYPTION_KEY =
      process.env.TWO_FACTOR_ENCRYPTION_KEY ||
      'default_key_must_be_32_bytes_len'

    const iv = encryptedData.subarray(0, IV_LENGTH)
    const encryptedText = encryptedData.subarray(IV_LENGTH)
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()
  }
}

export const advancedEncryptionService = new AdvancedEncryptionService()
