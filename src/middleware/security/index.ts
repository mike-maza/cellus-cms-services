import { Request, Response, NextFunction } from 'express'
import rateLimit from 'express-rate-limit'
import slowDown from 'express-slow-down'
import helmet from 'helmet'

interface ApiResponse {
  success: boolean
  message: string
  data?: any
}

export class SecurityMiddleware {
  /**
   * Rate limiting general
   */
  public static generalRateLimit = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: {
      success: false,
      message: 'Demasiadas solicitudes, intenta de nuevo más tarde'
    } as ApiResponse,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { default: false },
    // Usar ID de usuario si está autenticado, sino usar IP del body o request
    keyGenerator: (req: Request) => {
      const user = (req as any).user
      const ip = req.body?.ipAddress || req.ip
      return user?.id ? `user:${user.id}` : `ip:${ip}`
    },
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        message: 'Demasiadas solicitudes, intenta de nuevo más tarde'
      } as ApiResponse)
    }
  })

  /**
   * Rate limiting estricto para autenticación
   */
  public static authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos por usuario
    message: {
      success: false,
      message: 'Demasiados intentos de login, intenta de nuevo en 15 minutos'
    } as ApiResponse,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { default: false },
    skipSuccessfulRequests: true,
    // Usar email/username del body para rate limit por usuario, o IP del body si existe
    keyGenerator: (req: Request) => {
      const identifier =
        req.body?.email || req.body?.username || req.body?.codEmployee
      const ip = req.body?.ipAddress || req.ip
      return identifier ? `auth:${identifier}` : `ip:${ip}`
    },
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        message: 'Demasiados intentos de login, intenta de nuevo en 15 minutos'
      } as ApiResponse)
    }
  })

  /**
   * Rate limiting para registro
   */
  public static registerRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // 3 registros por email por hora
    message: {
      success: false,
      message:
        'Demasiados registros desde esta cuenta, intenta de nuevo en 1 hora'
    } as ApiResponse,
    validate: { default: false },
    // Usar email del body para rate limit por usuario, o IP del body si existe
    keyGenerator: (req: Request) => {
      const email = req.body?.email
      const ip = req.body?.ipAddress || req.ip
      return email ? `register:${email}` : `ip:${ip}`
    },
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        message:
          'Demasiados registros desde esta cuenta, intenta de nuevo en 1 hora'
      } as ApiResponse)
    }
  })

  /**
   * Rate limiting para reset de contraseña
   */
  public static passwordResetRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // 3 intentos por email por hora
    message: {
      success: false,
      message: 'Demasiadas solicitudes de reset, intenta de nuevo en 1 hora'
    } as ApiResponse,
    validate: { default: false },
    // Usar email del body para rate limit por usuario, o IP del body si existe
    keyGenerator: (req: Request) => {
      const email = req.body?.email
      const ip = req.body?.ipAddress || req.ip
      return email ? `reset:${email}` : `ip:${ip}`
    },
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        message: 'Demasiadas solicitudes de reset, intenta de nuevo en 1 hora'
      } as ApiResponse)
    }
  })

  /**
   * Rate limiting para refresh token
   */
  public static refreshTokenRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos por token/IP
    message: {
      success: false,
      message:
        'Demasiadas solicitudes de refresh token, intenta de nuevo más tarde'
    } as ApiResponse,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { default: false },
    keyGenerator: (req: Request) => {
      const token = req.body?.refreshToken
      const ip = req.body?.ipAddress || req.ip
      return token ? `refresh:${token}` : `ip:${ip}`
    },
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        message:
          'Demasiadas solicitudes de refresh token, intenta de nuevo más tarde'
      } as ApiResponse)
    }
  })

  /**
   * Rate limiting para subida de archivos
   */
  public static fileUploadRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // 10 archivos por usuario
    message: {
      success: false,
      message: 'Demasiadas subidas de archivos, intenta de nuevo más tarde'
    } as ApiResponse,
    validate: { default: false },
    // Usar ID de usuario si está autenticado, sino usar IP
    keyGenerator: (req: Request) => {
      const user = (req as any).user
      return user?.id ? `upload:${user.id}` : `ip:${req.ip}`
    },
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        message: 'Demasiadas subidas de archivos, intenta de nuevo más tarde'
      } as ApiResponse)
    }
  })

  /**
   * Slow down middleware para ralentizar solicitudes
   */
  public static speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutos
    delayAfter: 50, // Permitir 50 solicitudes por ventana sin delay
    delayMs: () => 500, // Agregar 500ms de delay por solicitud después del límite
    maxDelayMs: 20000, // Máximo 20 segundos de delay
    validate: { default: false },
    // Usar ID de usuario si está autenticado, sino usar IP
    keyGenerator: (req: Request) => {
      const user = (req as any).user
      return user?.id ? `slow:${user.id}` : `ip:${req.ip}`
    }
  })

  /**
   * Configuración de Helmet para seguridad de headers
   */
  public static helmetConfig = helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        manifestSrc: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  })

  /**
   * Middleware para validar Content-Type
   */
  public static validateContentType(allowedTypes: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const contentType = req.headers['content-type']

      if (!contentType) {
        res.status(400).json({
          success: false,
          message: 'Content-Type header requerido'
        } as ApiResponse)
        return
      }

      const isAllowed = allowedTypes.some(type =>
        contentType.toLowerCase().includes(type.toLowerCase())
      )

      if (!isAllowed) {
        res.status(415).json({
          success: false,
          message: 'Content-Type no soportado'
        } as ApiResponse)
        return
      }

      next()
    }
  }

  /**
   * Middleware para validar tamaño del body
   */
  public static validateBodySize(maxSize: number) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const contentLength = req.headers['content-length']

      if (contentLength && parseInt(contentLength) > maxSize) {
        res.status(413).json({
          success: false,
          message: 'Payload demasiado grande'
        } as ApiResponse)
        return
      }

      next()
    }
  }

  /**
   * Middleware para sanitizar headers
   */
  public static sanitizeHeaders(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    // Remover headers potencialmente peligrosos
    delete req.headers['x-forwarded-host']
    delete req.headers['x-forwarded-server']

    // Validar User-Agent
    const userAgent = req.headers['user-agent']
    if (userAgent && userAgent.length > 500) {
      delete req.headers['user-agent']
    }

    next()
  }

  /**
   * Middleware para detectar y bloquear ataques comunes
   */
  public static detectAttacks(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const suspiciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // XSS
      /(\%27)|(\')|(\-\-)|(\%23)|(#)/i, // SQL Injection
      /((\%3C)|<)((\%2F)|\/)*[a-z0-9\%]+((\%3E)|>)/i, // HTML Injection
      /((\%3C)|<)((\%69)|i|(\%49))((\%6D)|m|(\%4D))((\%67)|g|(\%47))[^\n]+((\%3E)|>)/i // IMG tag injection
    ]

    const checkString =
      JSON.stringify(req.body) + req.url + JSON.stringify(req.query)

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(checkString)) {
        console.warn(
          `Potential attack detected from IP: ${req.ip}, Pattern: ${pattern}`
        )
        res.status(400).json({
          success: false,
          message: 'Solicitud inválida detectada'
        } as ApiResponse)
        return
      }
    }

    next()
  }

  /**
   * Middleware para logging de seguridad
   */
  public static securityLogger(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const startTime = Date.now()

    res.on('finish', () => {
      const duration = Date.now() - startTime
      const logData = {
        timestamp: new Date().toISOString(),
        ip: req.ip,
        method: req.method,
        url: req.url,
        userAgent: req.headers['user-agent'],
        statusCode: res.statusCode,
        duration,
        contentLength: res.get('content-length')
      }

      // Log solicitudes sospechosas
      if (res.statusCode >= 400 || duration > 5000) {
        console.warn('Security Log:', JSON.stringify(logData))
      }
    })

    next()
  }
}
