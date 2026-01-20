import { CorsOptions } from 'cors'

// Función para obtener los orígenes permitidos según el entorno
const getAllowedOrigins = (): string[] => {
  // 1. Si existe la variable de entorno, tiene prioridad (Producción y Desarrollo)
  // Ejemplo .env: CORS_ORIGIN=https://example.com,https://app.cellus.com
  if (process.env.CORS_ORIGIN) {
    return process.env.CORS_ORIGIN.split(',')
  }

  // 2. Si estamos en desarrollo y no hay variable, usamos defaults cómodos
  if (process.env.NODE_ENV !== 'production') {
    return ['http://localhost:5173']
  }

  // 3. En producción, si no hay variable configurada, es mejor fallar seguro (o retornar array vacío)
  console.warn(
    '⚠️ ADVERTENCIA: CORS_ORIGIN no está configurado en producción. Se bloquearán todas las peticiones CORS.'
  )
  return []
}

const whitelist = getAllowedOrigins()

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Permitir requests sin origen (como apps móviles, curl o Postman)
    // En producción estricta, podrías querer bloquear esto dependiendo de tu caso de uso
    if (!origin) {
      return callback(null, true)
    }

    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 horas
}
