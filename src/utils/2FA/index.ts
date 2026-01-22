import { Totp } from 'time2fa'
import * as qrcode from 'qrcode'

// DB Imports
import {
  getDataOfCode2FA,
  insertedSecretCode2FA,
  updatedUser
} from '~/database/2FADB'

import { advancedEncryptionService } from '~/config/encryption'

import {
  RESPONSE_CODE_FAIL,
  RESPONSE_CODE_SUCCESS,
  RESPONSE_MESSAGE_FAIL,
  RESPONSE_MESSAGE_SUCCESS,
  RESPONSE_STATUS_FAIL,
  RESPONSE_STATUS_SUCCESS
} from '~/constants/RESPONSE_MESSAGE'

export class TwoFactorAuth {
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

        try {
          secretCodeVerify = advancedEncryptionService.decryptFromBuffer(
            record.EncryptedSecret
          )
        } catch (error) {
          secretCodeVerify = advancedEncryptionService.decryptTwoFactorLegacy(
            record.EncryptedSecret
          )
        }
      }

      const isValid = Totp.validate({
        passcode: code,
        secret: secretCodeVerify
      })

      if (isValid) {
        if (register) {
          const encryptedSecret =
            advancedEncryptionService.encryptToBuffer(secretCodeVerify)

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
