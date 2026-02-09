import { Totp } from 'time2fa'
import * as qrcode from 'qrcode'

// Importaciones de Base de Datos
import {
  db_getAllDevicesOf2FA as getAllDevicesOf2FA,
  db_createNewDevice2FA as createNewDevice2FA,
  db_updateDevice2FA as updateDevice2FA,
  db_deleteDevice2FA as deleteDevice2FA,
  db_getDevice2FAById as getDevice2FAById
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
   * Generar secreto de 2FA y código QR
   * @param user Nombre de usuario o identificador
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
      throw new Error(`Error al generar datos de 2FA: ${error}`)
    }
  }

  /**
   * Validar código de 2FA
   * Maneja encriptación, intentos fallidos y verificación
   */
  public static async validateCode(
    res: any,
    code: string,
    user: string,
    register: boolean,
    secret?: string,
    twoFactorID?: string,
    deviceName?: string
  ) {
    try {
      let secretCodeVerify = ''

      if (register) {
        secretCodeVerify = secret || ''
      } else {
        const record = (await getDevice2FAById(user, Number(twoFactorID)))[0]

        console.log('*'.repeat(50))
        console.log(record)
        console.log('*'.repeat(50))

        if (!record || !record.EncryptedSecret) {
          throw new Error('Registro de 2FA no encontrado o inválido')
        }

        if (!record.IsEnabled) {
          res.status(403).send({
            ValidateResponseCode: {
              responseCode: RESPONSE_CODE_FAIL,
              message: 'El dispositivo no está activo',
              status: RESPONSE_STATUS_FAIL
            }
          })
          return
        }

        try {
          console.log(`record.EncryptedSecret: ${record.EncryptedSecret}`)
          secretCodeVerify = advancedEncryptionService.decryptFromBuffer(
            record.EncryptedSecret
          )

          console.log(`secretCodeVerify: ${secretCodeVerify}`)
        } catch (error) {
          console.log(error)
          secretCodeVerify = advancedEncryptionService.decryptTwoFactorLegacy(
            record.EncryptedSecret
          )
          console.log(`secretCodeVerifyyyyy: ${secretCodeVerify}`)
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

          await createNewDevice2FA({
            Username: user,
            EncryptedSecret: encryptedSecret,
            DeviceName: deviceName || 'Dispositivo desconocido'
          })
        }

        res.status(200).send({
          ValidateResponseCode: {
            responseCode: RESPONSE_CODE_SUCCESS,
            message: 'ÉXITO',
            status: RESPONSE_STATUS_SUCCESS
          }
        })
      } else {
        res.status(400).send({
          ValidateResponseCode: {
            responseCode: RESPONSE_CODE_FAIL,
            message: 'CÓDIGO INVÁLIDO',
            status: RESPONSE_STATUS_FAIL
          }
        })
      }
    } catch (error) {
      console.error('Error de validación de 2FA:', error)
      res.status(500).send({
        ValidateResponseCode: {
          responseCode: RESPONSE_CODE_FAIL,
          message: 'Error interno del servidor durante la validación de 2FA',
          status: RESPONSE_STATUS_FAIL
        }
      })
    }
  }
}
