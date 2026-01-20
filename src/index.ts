import express, { Application } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import compression from 'compression'
import swaggerUi from 'swagger-ui-express'
import http from 'http'

import { corsOptions } from '~/config/cors'

// Configuraciones y Middleware de seguridad
import { swaggerSpec } from '~/config/swagger'
import { SecurityMiddleware } from '~/middleware/security'
import { ValidationMiddleware } from '~/middleware/validation'
import { ErrorHandler } from '~/middleware/errorHandler'
import { globalErrorHandler } from '~/controller/errorController'
import { initWebSocketServer } from '~/websocket/server'

// Routes
import companiesRoutes from '~/routes/companiesRoutes'
import usersRoutes from '~/routes/userRoutes'
import credentialsRoutes from '~/routes/credentialsRoutes'
import twoFactorRoutes from '~/routes/twoFactorRoutes'
import sessionRoutes from '~/routes/sessionRoutes'
import permissionRoutes from '~/routes/permissionsRoutes'
import rolesRoutes from '~/routes/rolRoutes'
import requestRoutes from '~/routes/requestsRoutes'
import tokensRoutes from '~/routes/tokensRoutes'
import employeeRoutes from '~/routes/employeeRoutes'
import paymentsRoutes from '~/routes/paymentsRoutes'
import emailRoutes from '~/routes/emailRoutes'
import stepsRoutes from '~/routes/stepsRoutes'
import dynamicRoutes from '~/routes/dynamicRoutes'
import vacationRoutes from '~/routes/vacationRoutes'
import advanceRoutes from '~/routes/advanceRoutes'
import calendarRoutes from '~/routes/calendarRoutes'

import { googleSheetsPayments } from '~/utils/googleSheet'
import { sendBoletaEmail, sendWelcomeEmail } from './utils/emailSender'

class Services {
  public app: Application
  public server: http.Server
  public urlBase = '/api/v2/dash-pay-cell'
  public wss: any

  constructor() {
    this.app = express()
    this.app.set('port', process.env.PORT || 23286)
    this.server = http.createServer(this.app)

    this.initializeMiddlewares()
    this.initializeRoutes()
    this.initializeWebSocket()
    this.initializeErrorHandling()
    this.setupGracefulShutdown()
  }

  private initializeMiddlewares() {
    // Configuración de seguridad básica
    this.app.use(SecurityMiddleware.helmetConfig)
    this.app.use(SecurityMiddleware.sanitizeHeaders)
    this.app.use(SecurityMiddleware.detectAttacks)
    this.app.use(SecurityMiddleware.securityLogger)

    // Configuración de CORS
    this.app.use(cors(corsOptions))

    // Middlewares de parsing y compresión
    // this.app.use(compression())
    this.app.use(
      express.json({
        limit: '10mb',
        verify: (req, res, buf) => {
          // Verificar que el JSON sea válido
          try {
            JSON.parse(buf.toString())
          } catch (e) {
            throw new Error('JSON malformado')
          }
        }
      })
    )
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }))

    // Logging
    if (process.env.NODE_ENV === 'development') {
      this.app.use(morgan('dev'))
    } else {
      this.app.use(morgan('combined'))
    }

    // Rate limiting y speed limiting
    // this.app.use(SecurityMiddleware.speedLimiter)

    // Validación y sanitización global
    this.app.use(ValidationMiddleware.sanitizeInput)
    this.app.use(ValidationMiddleware.validateEncoding)
    this.app.use(ValidationMiddleware.validateObjectDepth(5))
    this.app.use(ValidationMiddleware.validateArrayLimits(100))

    // Documentación Swagger
    this.app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Cellus Payments Services - API Documentation',
        swaggerOptions: {
          persistAuthorization: true,
          displayRequestDuration: true,
          filter: true,
          syntaxHighlight: {
            activate: true,
            theme: 'monokai'
          }
        },
        customCssUrl: undefined, // No usar CDN externo
        customJs: undefined, // No usar CDN externo
        customfavIcon: undefined
      })
    )

    // Servir especificación OpenAPI en JSON
    this.app.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json')
      res.send(swaggerSpec)
    })
  }

  private initializeWebSocket() {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:5173'
    ]

    this.wss = initWebSocketServer(this.server, {
      allowedOrigins,
      jwtSecret: process.env.JWT_SECRET || 'your-secret-key'
    })

    console.log('🔄 WebSocket server initialized')
  }

  private async initializeRoutes() {
    // Configurar rutas de autenticación
    // this.app.use(`${this.urlBase}/auth`, authRoutes);

    // Ruta raíz
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Cellus Payments Services',
        version: '2.0.0',
        documentation: '/api-docs',
        health: '/api/health',
        websocket: 'ws://localhost:' + this.app.get('port')
      })
    })

    // Health check endpoint para Docker
    this.app.get('/api/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: '2.0.0'
      })
    })

    // Montar rutas de la API
    this.app.use(`${this.urlBase}/companies`, companiesRoutes as any)
    this.app.use(`${this.urlBase}/employees`, employeeRoutes as any)
    this.app.use(`${this.urlBase}/users`, usersRoutes as any)
    this.app.use(`${this.urlBase}/vacations`, vacationRoutes as any)
    this.app.use(`${this.urlBase}/advances`, advanceRoutes as any)
    this.app.use(`${this.urlBase}/calendar`, calendarRoutes as any)
    this.app.use(`${this.urlBase}/payments`, paymentsRoutes as any)
    this.app.use(`${this.urlBase}/permissions`, permissionRoutes as any)
    this.app.use(`${this.urlBase}/roles`, rolesRoutes as any)

    // Dynamic Company Routes
    this.app.use(`${this.urlBase}/dynamic`, dynamicRoutes as any)

    // Manejar rutas no encontradas
    this.app.use('/*path', ErrorHandler.notFound)
  }

  private initializeErrorHandling(): void {
    // Configurar manejadores globales de errores
    // ErrorHandler.setupGlobalErrorHandlers();
    // Middleware de manejo de errores
    // this.app.use(ErrorHandler.handle)
    // Configurar manejadores globales de errores
    this.app.use(globalErrorHandler)
  }

  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} recibido. Iniciando cierre graceful...`)

      try {
        // Cerrar conexión de base de datos
        // const db = Database.getInstance()
        // await db.disconnect()

        // Cerrar servidor WebSocket
        if (this.wss) {
          this.wss.close(() => {
            console.log('✅ WebSocket server cerrado')
          })
        }

        // Cerrar servidor HTTP
        this.server.close(() => {
          console.log('✅ Servidor HTTP cerrado')
        })

        console.log('✅ Aplicación cerrada correctamente')
        process.exit(0)
      } catch (error) {
        console.error('❌ Error durante el cierre:', error)
        process.exit(1)
      }
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))
  }

  public async start(): Promise<void> {
    try {
      // Conectar a la base de datos
      //   const db = Database.getInstance();
      //   await db.connect();

      // Iniciar servidor HTTP (que también maneja WebSocket)
      this.server.listen(this.app.get('port'), () => {
        console.log(`
🚀 Servidor iniciado exitosamente
📍 Puerto: ${this.app.get('port')}
🌍 Entorno: ${process.env.NODE_ENV || 'development'}
📚 Documentación: http://localhost:${this.app.get('port')}/api-docs
🔍 Health Check: http://localhost:${this.app.get('port')}/api/health
🔄 WebSocket: ws://localhost:${this.app.get('port')}
        `)
      })

      // Programar limpieza de tokens expirados cada hora
      setInterval(
        async () => {
          try {
            //   const db = Database.getInstance();
            //   await db.executeQuery('EXEC sp_CleanupExpiredTokens');
            console.log('🧹 Limpieza de tokens expirados completada')
          } catch (error) {
            console.error('❌ Error en limpieza de tokens:', error)
          }
        },
        60 * 60 * 1000
      ) // 1 hora
    } catch (error) {
      console.error('❌ Error al iniciar la aplicación:', error)
      process.exit(1)
    }
  }
}

// Llamamos a la clase y seteamos estos valores a una variable
const server = new Services()
// Iniciamos el metodo principal para inicial el servicio
export default server.start()
