import express, { Application } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import compression from 'compression'
import swaggerUi from 'swagger-ui-express';

// Configuraciones y Middleware de seguridad
import { swaggerSpec } from './config/swagger';
import { SecurityMiddleware } from './middleware/security'
import { ValidationMiddleware } from './middleware/validation';
import { ErrorHandler } from './middleware/errorHandler';

class Services {
  public app: Application
  public urlBase = '/api/v2/dash-cell'

  constructor() {
    this.app = express()
    this.app.set('port', process.env.PORT || 23286)

    this.initializeMiddlewares()
    this.initializeRoutes()
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
    this.app.use(
      cors({
        origin: process.env.CORS_ORIGIN?.split(',') || [
          'http://localhost:3000'
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        maxAge: 86400 // 24 horas
      })
    )

    // Middlewares de parsing y compresión
    this.app.use(compression())
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
    this.app.use(SecurityMiddleware.speedLimiter);

    // Validación y sanitización global
    this.app.use(ValidationMiddleware.validateEncoding);
    this.app.use(ValidationMiddleware.validateObjectDepth(5));
    this.app.use(ValidationMiddleware.validateArrayLimits(100));

    // Documentación Swagger
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Cellus Payments Services - Documentation',
    }));

    // Servir especificación OpenAPI en JSON
    this.app.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
  }

  private initializeRoutes(): void {
    // Ruta raíz
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Cellus Payments Services',
        version: '1.0.0',
        documentation: '/api-docs',
        health: '/api/health'
      })
    })

    // Montar better-auth
    // this.app.use('/api/auth', auth.handler)

    // Montar rutas de la API
    // this.app.use('/api', routes)

    // Manejar rutas no encontradas
    this.app.use('/*path', ErrorHandler.notFound)
  }

  private initializeErrorHandling(): void {
    // Configurar manejadores globales de errores
    // ErrorHandler.setupGlobalErrorHandlers();
    // Middleware de manejo de errores
    // this.app.use(ErrorHandler.handle);
  }

  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} recibido. Iniciando cierre graceful...`)

      try {
        // Cerrar conexión de base de datos
        // const db = Database.getInstance()
        // await db.disconnect()

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

      // Iniciar servidor
      this.app.listen(this.app.get('port'), () => {
        console.log(`
🚀 Servidor iniciado exitosamente
📍 Puerto: ${this.app.get('port')}
🌍 Entorno: ${process.env.NODE_ENV || 'development'}
📚 Documentación: http://localhost:${this.app.get('port')}/api-docs
🔍 Health Check: http://localhost:${this.app.get('port')}/api/health
        `)
      })

      // Programar limpieza de tokens expirados cada hora
      setInterval(async () => {
        try {
          //   const db = Database.getInstance();
          //   await db.executeQuery('EXEC sp_CleanupExpiredTokens');
          console.log('🧹 Limpieza de tokens expirados completada')
        } catch (error) {
          console.error('❌ Error en limpieza de tokens:', error)
        }
      }, 60 * 60 * 1000) // 1 hora
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
