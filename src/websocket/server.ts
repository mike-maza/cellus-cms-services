import http from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import jwt from 'jsonwebtoken'
import { parse } from 'url'
import { googleSheetsClients, googleSheetsPayments } from '../utils/googleSheet'
import { auditLogger, AuditLogEntry } from './audit'
import { CompanyCreationService } from '~/services/CompanyCreationService'
import {
  processManager,
  BackgroundProcess
} from '~/services/ProcessManagerService'
import {
  sendWelcomeEmail,
  sendBoletaEmail,
  sendBoletoOrnatoEmail,
  sendWelcomeCMSEmail,
  sendResetPasswordEmail
} from '~/utils/emailSender'
import { generatePassword } from '~/utils/generateUniqueId'
import { sendSMS } from '~/services/SMS'

type DecodedToken = {
  sub?: string
  email?: string
  role?: string
  scopes?: string[]
  iat?: number
  exp?: number
  [key: string]: any
}

type InitOptions = {
  allowedOrigins: string[]
  jwtSecret: string
}

type InboundMessage = {
  action: string
  payload?: any
}

// Construye entradas de auditoría sin incluir propiedades undefined
const makeAuditEntry = (base: {
  timestamp: string
  userId?: string | undefined
  email?: string | undefined
  action: string
  payload?: any | undefined
  result: 'success' | 'error' | 'forbidden' | 'rate_limited'
  errorMessage?: string | undefined
  ip?: string | undefined
  userAgent?: string | undefined
}): AuditLogEntry => {
  // Incluir solo los campos requeridos y añadir opcionales si están definidos
  const { timestamp, action, result } = base
  const entry: AuditLogEntry = { timestamp, action, result }
  if (base.userId !== undefined) entry.userId = base.userId
  if (base.email !== undefined) entry.email = base.email
  if (base.payload !== undefined) entry.payload = base.payload
  if (base.errorMessage !== undefined) entry.errorMessage = base.errorMessage
  if (base.ip !== undefined) entry.ip = base.ip
  if (base.userAgent !== undefined) entry.userAgent = base.userAgent
  return entry
}

/**
 * Format any error into a readable string
 */
const formatError = (err: any): string => {
  if (!err) return 'No se proporcionó información detallada del error'
  if (typeof err === 'string') return err
  if (err.message && typeof err.message === 'string') return err.message
  if (err.error && typeof err.error === 'string') return err.error
  if (typeof err === 'object') {
    try {
      // Try to extract msg or message or responseCode
      const msg =
        err.message || err.msg || err.error || err.status || err.responseCode
      if (msg && typeof msg === 'string') return msg
      return JSON.stringify(err)
    } catch {
      return String(err)
    }
  }
  return String(err)
}

const isOriginAllowed = (
  origin: string | undefined,
  allowed: string[]
): boolean => {
  if (!origin) return false
  try {
    const url = new URL(origin)
    const host = `${url.protocol}//${url.host}`
    return allowed.includes(host)
  } catch {
    // If origin is not a valid URL, do a simple exact match check
    return allowed.includes(origin)
  }
}

const RATE_LIMIT_WINDOW_MS = 60_000
const MAX_MESSAGES_PER_WINDOW = 50
const MAX_SENSITIVE_ACTIONS_PER_WINDOW = 5

class RateLimiter {
  private windowStart = Date.now()
  private generalCount = 0
  private sensitiveCount = 0

  allow(isSensitive = false): boolean {
    const now = Date.now()
    if (now - this.windowStart > RATE_LIMIT_WINDOW_MS) {
      this.windowStart = now
      this.generalCount = 0
      this.sensitiveCount = 0
    }
    if (isSensitive) {
      if (this.sensitiveCount >= MAX_SENSITIVE_ACTIONS_PER_WINDOW) return false
      this.sensitiveCount += 1
    } else {
      if (this.generalCount >= MAX_MESSAGES_PER_WINDOW) return false
      this.generalCount += 1
    }
    return true
  }
}

export function initWebSocketServer(
  server: http.Server,
  opts: InitOptions
): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true })

  const allowedOrigins = opts.allowedOrigins
  const jwtSecret = opts.jwtSecret

  server.on('upgrade', (request, socket, head) => {
    const originHeader = request.headers.origin
    console.log('🔌 WS Upgrade Request:', {
      url: request.url,
      origin: originHeader,
      headers: request.headers
    })

    if (!isOriginAllowed(originHeader, allowedOrigins)) {
      console.log(
        '❌ WS Origin rejected:',
        originHeader,
        'Allowed:',
        allowedOrigins
      )
      socket.write('HTTP/1.1 403 Forbidden\r\n\r\n')
      socket.destroy()
      return
    }

    // Extract token from Authorization header or query string
    const authHeader = request.headers['authorization']
    const urlParts = parse(request.url || '', true)
    const queryToken = (urlParts.query?.token || '') as string
    const headerToken =
      typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : undefined

    const token = headerToken || queryToken
    let decoded: DecodedToken | undefined

    const isDev =
      process.env.NODE_ENV === 'development' ||
      process.env.NODE_ENV === 'desarrollo'

    if (!token) {
      if (isDev) {
        console.log(
          '⚠️ WebSocket: Development mode detected. Bypassing auth token check.'
        )
        decoded = {
          sub: 'dev-user-id',
          email: 'dev@localhost',
          role: 'superadmin',
          scopes: ['sheets:read'],
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 86400 // 24h
        }
      } else {
        console.log('❌ WS Auth failed: No token provided in production')
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
        socket.destroy()
        return
      }
    } else {
      try {
        decoded = jwt.verify(token, jwtSecret) as DecodedToken
        console.log(
          '✅ WS Token verified for user:',
          decoded.email || decoded.sub
        )
      } catch (e: any) {
        if (isDev) {
          console.log(
            '⚠️ WebSocket: Invalid token in dev mode. Falling back to dev identity.',
            e.message
          )
          decoded = {
            sub: 'dev-user-id',
            email: 'dev@localhost',
            role: 'superadmin',
            scopes: ['sheets:read'],
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 86400 // 24h
          }
        } else {
          console.log('❌ WS Token verification failed:', e.message)
          socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
          socket.destroy()
          return
        }
      }
    }

    wss.handleUpgrade(request, socket as any, head, ws => {
      console.log('🚀 WS Connection Upgraded successfully')
      // Attach identity to websocket instance
      ;(ws as WebSocket & { user?: DecodedToken }).user = decoded
      wss.emit('connection', ws, request)
    })
  })

  wss.on(
    'connection',
    (
      ws: WebSocket & { user?: DecodedToken },
      request: http.IncomingMessage
    ) => {
      const limiter = new RateLimiter()
      const clientIp = request.socket.remoteAddress || 'unknown'
      const userAgent = request.headers['user-agent'] || 'unknown'

      // Send initial sync of processes
      const syncMsg = JSON.stringify({
        ok: true,
        action: 'BULK_ACTION_SYNC',
        payload: {
          active: processManager.getAllActive(),
          history: processManager.getRecentHistory()
        }
      })
      ws.send(syncMsg)

      const broadcastProcessUpdate = (process: BackgroundProcess) => {
        const msg = JSON.stringify({
          ok: true,
          action: 'BULK_ACTION_UPDATE',
          payload: process
        })
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(msg)
          }
        })
      }

      ws.on('message', async raw => {
        let msg: InboundMessage | undefined
        try {
          msg = JSON.parse(raw.toString()) as InboundMessage
        } catch {
          ws.send(
            JSON.stringify({
              ok: false,
              error: 'invalid_json',
              message: 'El mensaje debe ser JSON válido.'
            })
          )
          return
        }

        if (!msg || typeof msg.action !== 'string') {
          ws.send(
            JSON.stringify({
              ok: false,
              error: 'invalid_format',
              message: 'Debe incluir "action" como string.'
            })
          )
          return
        }

        const action = msg.action

        // General rate limit
        if (!limiter.allow(false)) {
          ws.send(
            JSON.stringify({
              ok: false,
              error: 'rate_limited',
              message: 'Demasiados mensajes en la ventana de tiempo.'
            })
          )
          return
        }

        // Simple actions
        if (action === 'ping') {
          ws.send(JSON.stringify({ ok: true, action: 'pong', ts: Date.now() }))

          // Log ping action
          const auditEntry = makeAuditEntry({
            timestamp: new Date().toISOString(),
            userId: ws.user?.sub,
            // email: ws.user?.email,
            action: 'ping',
            result: 'success',
            ip: clientIp,
            userAgent
          })
          auditLogger.log(auditEntry)
          return
        }

        // Restricted actions require identity and role checks
        const user = ws.user
        if (!user) {
          ws.send(
            JSON.stringify({
              ok: false,
              error: 'unauthorized',
              message: 'Acción restringida: requiere autenticación.'
            })
          )

          // Log unauthorized attempt
          const auditEntry: AuditLogEntry = {
            timestamp: new Date().toISOString(),
            action,
            result: 'forbidden',
            errorMessage: 'Acción restringida: requiere autenticación.',
            ip: clientIp,
            userAgent
          }
          auditLogger.log(auditEntry)
          return
        }

        // Sensitive rate limit
        const isSensitive =
          action === 'googleSheetsClients' || action === 'googleSheetsPayments'
        if (isSensitive && !limiter.allow(true)) {
          ws.send(
            JSON.stringify({
              ok: false,
              error: 'rate_limited',
              message: 'Demasiadas acciones sensibles.'
            })
          )

          // Log rate limit violation
          const auditEntry = makeAuditEntry({
            timestamp: new Date().toISOString(),
            userId: user.sub,
            // email: user.email,
            action,
            result: 'rate_limited',
            errorMessage: 'Demasiadas acciones sensibles.',
            ip: clientIp,
            userAgent
          })
          auditLogger.log(auditEntry)
          return
        }

        // Role-based authorization
        const role = (user.role || '').toLowerCase()
        const scopes = Array.isArray(user.scopes) ? user.scopes : []
        const hasPrivilege =
          role === 'admin' ||
          role === 'superadmin' ||
          scopes.includes('sheets:read')

        if (action === 'googleSheetsClients') {
          if (!hasPrivilege) {
            ws.send(
              JSON.stringify({
                ok: false,
                error: 'forbidden',
                message: 'No tienes permisos para esta acción.'
              })
            )

            // Log permission denied
            const auditEntry = makeAuditEntry({
              timestamp: new Date().toISOString(),
              userId: user.sub,
              // email: user.email,
              action,
              result: 'forbidden',
              errorMessage: 'No tienes permisos para esta acción.',
              ip: clientIp,
              userAgent
            })

            auditLogger.log(auditEntry)
            return
          }

          const p = msg.payload || {}
          const sheetId = typeof p.sheetId === 'string' ? p.sheetId : ''
          const sheetName = typeof p.sheetName === 'string' ? p.sheetName : ''
          const actor = user.email || user.sub || 'unknown'
          let sentInBatch = 0
          const BATCH_SIZE = 5
          const BATCH_WAIT_TIME = 5 * 60 * 1000 // 5 minutes

          if (!sheetId || !sheetName) {
            ws.send(
              JSON.stringify({
                ok: false,
                error: 'invalid_payload',
                message: 'Faltan sheetId o sheetName.'
              })
            )

            // Log invalid payload
            const auditEntry = makeAuditEntry({
              timestamp: new Date().toISOString(),
              userId: user.sub,
              // email: user.email,
              action,
              payload: p,
              result: 'error',
              errorMessage: 'Faltan sheetId o sheetName.',
              ip: clientIp,
              userAgent
            })
            auditLogger.log(auditEntry)
            return
          }

          try {
            let bgProcessId: string | undefined

            // Emitir progreso en tiempo real mientras se procesa
            const result = await googleSheetsClients(
              sheetId,
              sheetName,
              actor,
              async (evt: any) => {
                try {
                  if (evt.type === 'started') {
                    const total = evt.data?.totalRows || 0
                    const bgProcess = processManager.startProcess(
                      'Sincronización de Empleados',
                      user,
                      total
                    )
                    bgProcessId = bgProcess.id
                    broadcastProcessUpdate(bgProcess)
                  }

                  if (bgProcessId) {
                    if (evt.type === 'created' || evt.type === 'updated') {
                      processManager.updateProgress(
                        bgProcessId,
                        evt.rowNumber - 1,
                        evt.message
                      )
                      broadcastProcessUpdate(
                        processManager.getProcess(bgProcessId)!
                      )
                    } else if (evt.type === 'provider_warning') {
                      processManager.addLog(bgProcessId, evt.message, 'info')
                      broadcastProcessUpdate(
                        processManager.getProcess(bgProcessId)!
                      )
                    } else if (evt.type === 'error') {
                      processManager.addLog(bgProcessId, evt.message, 'error')
                      broadcastProcessUpdate(
                        processManager.getProcess(bgProcessId)!
                      )
                    } else if (evt.type === 'no_email') {
                      processManager.updateProgress(
                        bgProcessId,
                        evt.rowNumber - 1
                      )
                      broadcastProcessUpdate(
                        processManager.getProcess(bgProcessId)!
                      )
                    }
                  }
                  // Si se crea un usuario, enviar correo de bienvenida
                  if (
                    evt.type === 'created' &&
                    evt.email &&
                    evt.data?.isNew === true
                  ) {
                    const username = evt.data?.username || 'Usuario'
                    const fullName = evt.data?.fullName || 'Usuario'
                    const password = evt.data?.password || 'Temp123*'
                    const contact = evt.email
                    // console.log(`📧 Enviando bienvenida a ${contact}`)

                    // Enviar correo de forma asíncrona dentro del callback
                    await sendWelcomeEmail(
                      username,
                      contact,
                      fullName,
                      password,
                      process.env.DOMAIN || 'https://cellus-cms.cellus.com.gt'
                    ).catch(console.error)

                    sentInBatch++
                    console.log(
                      `[Yahoo/Spam Limit] Action: googleSheetsClients | Count: ${sentInBatch}/${BATCH_SIZE}`
                    )

                    if (sentInBatch >= BATCH_SIZE) {
                      const waitMinutes = BATCH_WAIT_TIME / 60000
                      const waitMessage = `⏳ Límite de batch alcanzado (${BATCH_SIZE} correos). Esperando ${waitMinutes} minutos para evitar bloqueos (Yahoo/Spam)...`
                      console.log(`[Yahoo/Spam Limit] ${waitMessage}`)

                      if (bgProcessId) {
                        processManager.addLog(bgProcessId, waitMessage, 'info')
                        broadcastProcessUpdate(
                          processManager.getProcess(bgProcessId)!
                        )
                      }

                      ws.send(
                        JSON.stringify({
                          ok: true,
                          action,
                          progress: {
                            type: 'info',
                            message: waitMessage
                          }
                        })
                      )

                      await new Promise(resolve =>
                        setTimeout(resolve, BATCH_WAIT_TIME)
                      )
                      sentInBatch = 0 // Reset counter after waiting
                      console.log(
                        `[Yahoo/Spam Limit] Wait finished. Resuming...`
                      )
                    }

                    await new Promise(r => setTimeout(r, 50))
                  }

                  ws.send(JSON.stringify({ ok: true, action, progress: evt }))
                } catch (_) {}
              }
            )

            if (bgProcessId) {
              processManager.finishProcess(bgProcessId, 'completed')
              broadcastProcessUpdate(processManager.getProcess(bgProcessId)!)
            }
            // Enviar resultado final
            try {
              ws.send(JSON.stringify({ ok: true, action, result }))
            } catch (_) {}

            // Log successful action
            const auditEntry = makeAuditEntry({
              timestamp: new Date().toISOString(),
              userId: user.sub,
              // email: user.email,
              action,
              payload: { sheetId, sheetName },
              result: 'success',
              ip: clientIp,
              userAgent
            })
            auditLogger.log(auditEntry)
          } catch (err: any) {
            ws.send(
              JSON.stringify({
                ok: false,
                error: 'internal_error',
                message: err?.message || 'Error interno.'
              })
            )

            // Log error
            const auditEntry = makeAuditEntry({
              timestamp: new Date().toISOString(),
              userId: user.sub,
              // email: user.email,
              action,
              payload: { sheetId, sheetName },
              result: 'error',
              errorMessage: err?.message || 'Error interno.',
              ip: clientIp,
              userAgent
            })
            auditLogger.log(auditEntry)
          }
          return
        }

        if (action === 'googleSheetsPayments') {
          if (!hasPrivilege) {
            ws.send(
              JSON.stringify({
                ok: false,
                error: 'forbidden',
                message: 'No tienes permisos para esta acción.'
              })
            )
            return
          }

          const p = msg.payload || {}
          const sheetId = typeof p.sheetId === 'string' ? p.sheetId : ''
          const sheetName = typeof p.sheetName === 'string' ? p.sheetName : ''
          const actor = user.email || user.sub || 'unknown'

          if (!sheetId || !sheetName) {
            ws.send(
              JSON.stringify({
                ok: false,
                error: 'invalid_payload',
                message: 'Faltan sheetId o sheetName.'
              })
            )
            return
          }

          try {
            let bgProcessId: string | undefined

            // Enviar resultado final
            const result = await googleSheetsPayments(
              sheetId,
              sheetName,
              actor,
              async (evt: any) => {
                try {
                  if (evt.type === 'started') {
                    const total = evt.data?.totalRows || 0
                    const bgProcess = processManager.startProcess(
                      'Sincronización de Pagos',
                      user,
                      total
                    )
                    bgProcessId = bgProcess.id
                    broadcastProcessUpdate(bgProcess)
                  }

                  if (bgProcessId) {
                    if (evt.type === 'created' || evt.type === 'updated') {
                      processManager.updateProgress(
                        bgProcessId,
                        evt.rowNumber - 1,
                        evt.message
                      )
                      broadcastProcessUpdate(
                        processManager.getProcess(bgProcessId)!
                      )
                    } else if (evt.type === 'error') {
                      processManager.addLog(bgProcessId, evt.message, 'error')
                      broadcastProcessUpdate(
                        processManager.getProcess(bgProcessId)!
                      )
                    }
                  }

                  ws.send(JSON.stringify({ ok: true, action, progress: evt }))
                } catch (_) {}
              }
            )

            if (bgProcessId) {
              processManager.finishProcess(bgProcessId, 'completed')
              broadcastProcessUpdate(processManager.getProcess(bgProcessId)!)
            }

            try {
              ws.send(JSON.stringify({ ok: true, action, result }))
            } catch (_) {}

            // Log successful action
            const auditEntry = makeAuditEntry({
              timestamp: new Date().toISOString(),
              userId: user.sub,
              // email: user.email,
              action,
              payload: { sheetId, sheetName },
              result: 'success',
              ip: clientIp,
              userAgent
            })
            auditLogger.log(auditEntry)
          } catch (err: any) {
            ws.send(
              JSON.stringify({
                ok: false,
                error: 'internal_error',
                message: err?.message || 'Error interno.'
              })
            )

            // Log error
            const auditEntry = makeAuditEntry({
              timestamp: new Date().toISOString(),
              userId: user.sub,
              // email: user.email,
              action,
              payload: { sheetId, sheetName },
              result: 'error',
              errorMessage: err?.message || 'Error interno.',
              ip: clientIp,
              userAgent
            })
            auditLogger.log(auditEntry)
          }
          return
        }

        if (action === 'create_company') {
          if (!hasPrivilege) {
            ws.send(
              JSON.stringify({
                ok: false,
                error: 'forbidden',
                message: 'No tienes permisos para esta acción.'
              })
            )
            return
          }

          const payload = msg.payload || {}
          if (!payload.name || !payload.representante) {
            ws.send(
              JSON.stringify({
                ok: false,
                error: 'invalid_payload',
                message: 'Faltan datos de la empresa (name, representante).'
              })
            )
            return
          }

          const auditEntry = makeAuditEntry({
            timestamp: new Date().toISOString(),
            userId: user.sub,
            // email: user.email,
            action,
            payload: { company: payload.name },
            result: 'success',
            ip: clientIp,
            userAgent
          })
          auditLogger.log(auditEntry)

          CompanyCreationService.createCompanyStructure(ws, payload)
          return
        }

        if (action === 'BULK_ACTION_START') {
          console.log('Iniciar BULK_ACTION_START')

          if (!hasPrivilege) {
            ws.send(
              JSON.stringify({
                ok: false,
                error: 'forbidden',
                message: 'No tienes permisos.'
              })
            )
            return
          }

          const { type, items } = msg.payload || {}

          if (!type || !Array.isArray(items)) {
            ws.send(
              JSON.stringify({
                ok: false,
                error: 'invalid_payload',
                message: 'Faltan type o items.'
              })
            )
            return
          }

          const bgProcess = processManager.startProcess(
            type,
            user,
            items.length
          )
          broadcastProcessUpdate(bgProcess)

          // Process items asynchronously
          ;(async () => {
            let sentInBatch = 0
            const BATCH_SIZE = 5
            const BATCH_WAIT_TIME = 5 * 60 * 1000 // 5 minutes

            for (let i = 0; i < items.length; i++) {
              // Rate limiting / Throttling to avoid overwhelming SMTP
              await new Promise(resolve => setTimeout(resolve, 500))

              const item = items[i]
              const itemName = item.FullName || item.Name || `Item ${i + 1}`
              const contact = item.Email
              const itemId = item.CodEmployee || item.id || `idx_${i}`
              // const phone = item.CorporateNumber
              const phone = '40430268'
              const month = item.Month
              const year = item.Year
              const day = item.Day
              const paymentIndicator = item.PaymentIndicator
              const uiAuthorization = item.UiAuthorization
              const sendDate = item.SendDate
              const boletaType = item.Boleta

              if (!contact) {
                processManager.updateItemStatus(
                  bgProcess.id,
                  itemId,
                  'error',
                  'No tiene email'
                )
                processManager.addLog(
                  bgProcess.id,
                  `❌ Error procesando ${itemName}: No tiene email.`,
                  'error'
                )
                broadcastProcessUpdate(bgProcess)
                continue
              }

              let result: {
                success: boolean
                error?: any
                messageId?: string
              } = { success: false, error: 'Tipo desconocido' }

              try {
                const domain = process.env.DOMAIN || 'https://cellus.com.gt'

                console.clear()
                console.log('='.repeat(50))
                console.log(`type: ${type}`)
                // console.log(items)
                console.log('='.repeat(50))

                switch (type) {
                  case 'Correo de Bienvenida':
                    result = await sendWelcomeEmail(
                      item.CodEmployee || itemId,
                      contact,
                      itemName,
                      generatePassword(),
                      domain
                    )
                    break

                  case 'Restablecer Contraseña (Correo)':
                    result = await sendResetPasswordEmail(
                      contact,
                      itemName,
                      generatePassword(),
                      domain
                    )
                    break

                  case 'Enviar Contraseña (SMS)': {
                    const smsRes = await sendSMS(phone, generatePassword())
                    console.log('SMS API RAW RESPONSE:', smsRes)

                    const smsData = smsRes.SendSMSResponseCode
                    const isSuccess =
                      smsData?.status === 'SUCCESS' ||
                      smsData?.responseCode === '1'

                    result = {
                      success: isSuccess,
                      error: isSuccess ? undefined : smsData?.message
                    }
                    break
                  }

                  case 'WELCOME_CMS':
                    result = await sendWelcomeCMSEmail(
                      contact,
                      itemName,
                      item.Username || contact,
                      item.Password || generatePassword(),
                      domain
                    )
                    break

                  case 'Enviar Boleta':
                  case 'Enviar Boletas a Todos': {
                    // Filter conditions
                    if (sendDate) {
                      result = {
                        success: false,
                        error: 'Ya fue enviado anteriormente'
                      }
                      break
                    }

                    if (boletaType !== 'Digital') {
                      result = {
                        success: false,
                        error: `Este empleado ${itemName} recibe su boleta: (${boletaType})`
                      }
                      break
                    }

                    result = await sendBoletaEmail(
                      contact,
                      itemName,
                      month,
                      year,
                      `${domain}/payments/${paymentIndicator}/${uiAuthorization}`
                    )
                    break
                  }

                  case 'BOLETO_ORNATO':
                    result = await sendBoletoOrnatoEmail(
                      contact,
                      itemName,
                      item.Year ||
                        item.year ||
                        new Date().getFullYear().toString()
                    )
                    break

                  default:
                    result = {
                      success: false,
                      error: `Tipo de acción no soportado: ${type}`
                    }
                }
              } catch (err: any) {
                result = { success: false, error: err }
              }

              // Handle Batch Rate Limiting (Yahoo Anti-Spam)
              // This applies to ALL email types: Bienvenida, Reset, CMS, Boleta, Ornato
              const emailActionTypes = [
                'Correo de Bienvenida',
                'Restablecer Contraseña (Correo)',
                'WELCOME_CMS',
                'Enviar Boleta',
                'Enviar Boletas a Todos',
                'BOLETO_ORNATO'
              ]

              const isEmailAction = emailActionTypes.includes(type)
              const wasSkipped =
                result.error?.includes('Ya fue enviado anteriormente') ||
                result.error?.includes('recibe su boleta:')

              if (isEmailAction && !wasSkipped) {
                sentInBatch++
                console.log(
                  `[Yahoo/Spam Limit] Action: ${type} | Count: ${sentInBatch}/${BATCH_SIZE}`
                )

                if (sentInBatch >= BATCH_SIZE && i < items.length - 1) {
                  const waitMinutes = BATCH_WAIT_TIME / 60000
                  console.log(
                    `[Yahoo/Spam Limit] Limit reached. Waiting ${waitMinutes} minutes before next batch...`
                  )

                  processManager.addLog(
                    bgProcess.id,
                    `⏳ Límite de batch alcanzado (${BATCH_SIZE} correos). Esperando ${waitMinutes} minutos para evitar bloqueos (Yahoo/Spam)...`,
                    'info'
                  )
                  broadcastProcessUpdate(bgProcess)

                  await new Promise(resolve =>
                    setTimeout(resolve, BATCH_WAIT_TIME)
                  )
                  sentInBatch = 0 // Reset counter after waiting
                  console.log(`[Yahoo/Spam Limit] Wait finished. Resuming...`)
                }
              }

              // const displayTarget = type.includes('SMS') ? phone : contact

              if (!result.success) {
                const errorMessage = formatError(result.error || result)
                processManager.updateItemStatus(
                  bgProcess.id,
                  itemId,
                  'error',
                  errorMessage
                )
                processManager.addLog(
                  bgProcess.id,
                  // `❌ Error enviando a ${itemName} (${displayTarget}): ${errorMessage}`,
                  `❌ Error enviando a ${itemName}: ${errorMessage}`,
                  'error'
                )
              } else {
                processManager.updateItemStatus(
                  bgProcess.id,
                  itemId,
                  'success',
                  undefined
                )
                processManager.updateProgress(
                  bgProcess.id,
                  i + 1,
                  // `✅ Enviado ${type} a ${itemName} (${displayTarget}).`
                  `✅ Enviado ${type} a ${itemName}.`
                )
              }
              broadcastProcessUpdate(bgProcess)
            }
            processManager.finishProcess(bgProcess.id, 'completed')
            processManager.addLog(
              bgProcess.id,
              `🏁 Proceso "${type}" finalizado para ${items.length} elementos.`,
              'success'
            )
            broadcastProcessUpdate(bgProcess)
          })()

          return
        }

        if (action === 'BULK_ACTION_SYNC') {
          ws.send(
            JSON.stringify({
              ok: true,
              action: 'BULK_ACTION_SYNC',
              payload: {
                active: processManager.getAllActive(),
                history: processManager.getRecentHistory()
              }
            })
          )
          return
        }

        // Unknown action
        ws.send(
          JSON.stringify({
            ok: false,
            error: 'unknown_action',
            message: `Acción no soportada: ${action}`
          })
        )

        // Log unknown action
        const auditEntry = makeAuditEntry({
          timestamp: new Date().toISOString(),
          userId: user?.sub,
          email: user?.email,
          action,
          result: 'error',
          errorMessage: `Acción no soportada: ${action}`,
          ip: clientIp,
          userAgent
        })
        auditLogger.log(auditEntry)
      })

      ws.on('error', err => {
        // Avoid crashing on client errors
        console.warn('WS client error:', err?.message || err)
      })

      ws.on('close', () => {
        // Cleanup if needed
      })
    }
  )

  return wss
}
