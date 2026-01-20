import { Totp } from 'time2fa'
import * as qrcode from 'qrcode'
import * as crypto from 'crypto'

// DB Imports
import {
  getDataOfCode2FA,
  insertedSecretCode2FA,
  updatedUser
} from '~/database/2FADB'

import {
  RESPONSE_CODE_FAIL,
  RESPONSE_CODE_SUCCESS,
  RESPONSE_MESSAGE_FAIL,
  RESPONSE_MESSAGE_SUCCESS,
  RESPONSE_STATUS_FAIL,
  RESPONSE_STATUS_SUCCESS
} from '~/constants/RESPONSE_MESSAGE'

export class TwoFactorAuth {
  private static readonly ALGORITHM = 'aes-256-cbc'
  private static readonly ENCRYPTION_KEY =
    process.env.TWO_FACTOR_ENCRYPTION_KEY || 'default_key_must_be_32_bytes_len'
  private static readonly IV_LENGTH = 16

  /**
   * Helper: Encrypt text
   */
  private static encrypt(text: string): Buffer {
    const iv = crypto.randomBytes(this.IV_LENGTH)
    const key = crypto.scryptSync(this.ENCRYPTION_KEY, 'salt', 32)
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv)
    let encrypted = cipher.update(text)
    encrypted = Buffer.concat([encrypted, cipher.final()])
    return Buffer.concat([iv, encrypted])
  }

  /**
   * Helper: Decrypt data
   */
  private static decrypt(encryptedData: Buffer): string {
    const iv = encryptedData.subarray(0, this.IV_LENGTH)
    const encryptedText = encryptedData.subarray(this.IV_LENGTH)
    const key = crypto.scryptSync(this.ENCRYPTION_KEY, 'salt', 32)
    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv)
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()
  }

  /**
   * Generate 2FA Secret and QR Code
   * @param user Username or identifier
   */
  public static async generateURL(user: string) {
    try {
      const { url, secret } = Totp.generateKey({ issuer: 'CELLUS', user })

      const urlQR = await new Promise<string>((resolve, reject) => {
        qrcode.toDataURL(url, (err, dataURL) => {
          if (err) reject(err)
          else resolve(dataURL)
        })
      })

      return {
        urlQR,
        secretCode: secret
      }
    } catch (error) {
      throw new Error(`Error generating 2FA data: ${error}`)
    }
  }

  /**
   * Validate 2FA Code
   * Handles encryption, failed attempts, and verification
   */
  public static async validateCode(
    res: any,
    code: string,
    user: string,
    idUser: number,
    register: boolean,
    twoFactorID?: number,
    secret?: string,
    redirectTo?: string,
    deviceName?: string
  ) {
    try {
      let secretCodeVerify = ''

      if (register) {
        secretCodeVerify = secret || ''
      } else {
        const record = await getDataOfCode2FA(Number(twoFactorID))

        if (!record || !record.EncryptedSecret) {
          throw new Error('2FA record not found or invalid')
        }

        if (record.ConsecutiveFailedAttempts >= 5) {
          res.status(403).send({
            ValidateResponseCode: {
              responseCode: RESPONSE_CODE_FAIL,
              message: 'Account locked due to too many failed attempts',
              status: RESPONSE_STATUS_FAIL
            }
          })
          return
        }

        secretCodeVerify = this.decrypt(record.EncryptedSecret)
      }

      const isValid = Totp.validate({
        passcode: code,
        secret: secretCodeVerify
      })

      if (isValid) {
        if (register) {
          const encryptedSecret = this.encrypt(secretCodeVerify)

          await insertedSecretCode2FA({
            UserID: idUser,
            EncryptedSecret: encryptedSecret,
            IsEnabled: 1,
            ActivationDate: new Date(),
            DeviceName: deviceName || 'Unknown Device',
            CreatedDate: new Date(),
            ModifiedDate: new Date()
          })
        }

        if (redirectTo) {
          await updatedUser(user, 'RedirectURL', '/cms/two-factor')
        }

        res.status(200).send({
          ValidateResponseCode: {
            responseCode: RESPONSE_CODE_SUCCESS,
            message: RESPONSE_MESSAGE_SUCCESS,
            status: RESPONSE_STATUS_SUCCESS
          }
        })
      } else {
        res.status(400).send({
          ValidateResponseCode: {
            responseCode: RESPONSE_CODE_FAIL,
            message: `${RESPONSE_MESSAGE_FAIL} CODE`,
            status: RESPONSE_STATUS_FAIL
          }
        })
      }
    } catch (error) {
      console.error('2FA Validation Error:', error)
      res.status(500).send({
        ValidateResponseCode: {
          responseCode: RESPONSE_CODE_FAIL,
          message: 'Internal Server Error during 2FA validation',
          status: RESPONSE_STATUS_FAIL
        }
      })
    }
  }
}
