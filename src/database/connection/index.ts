import sql from 'mssql'
import config from '~/configDatabase'

// ============================================================================
// CONFIGURACIÓN DEL POOL DE CONEXIONES
// ============================================================================

const MAX_CONNECTIONS_BURST = 20 // Máximo de conexiones simultáneas
const IDLE_TIMEOUT_MS = 30000 // 30 segundos antes de cerrar conexiones inactivas
const REQUEST_TIMEOUT_MS = 60000 // 60 segundos timeout por request

const dbConfig: sql.config = {
  user: config.dbUser,
  password: config.dbPassword,
  server: config.dbServer,
  port: Number(config.dbPort),
  database: config.dbDatabase,
  options: {
    encrypt: false,
    trustServerCertificate: false,
    enableArithAbort: true
  },
  pool: {
    max: MAX_CONNECTIONS_BURST,
    min: 0, // No mantener conexiones mínimas para liberar recursos
    idleTimeoutMillis: IDLE_TIMEOUT_MS
  },
  requestTimeout: REQUEST_TIMEOUT_MS
}

// ============================================================================
// POOL GLOBAL Y GESTIÓN DE CONEXIONES
// ============================================================================

let globalPool: sql.ConnectionPool | null = null
let connectionAttempts = 0
const MAX_RETRY_ATTEMPTS = 3

/**
 * Obtiene o crea el pool de conexiones global
 * @returns Promise<sql.ConnectionPool>
 */
const getPool = async (): Promise<sql.ConnectionPool> => {
  try {
    // Si el pool existe y está conectado, reutilizarlo
    if (globalPool && globalPool.connected) {
      return globalPool
    }

    // Si el pool existe pero está cerrado, limpiarlo
    if (globalPool && !globalPool.connected) {
      globalPool = null
    }

    // Crear nuevo pool
    globalPool = await sql.connect(dbConfig)

    // Configurar eventos para monitoreo
    globalPool.on('error', err => {
      console.error('❌ Error en el pool de conexiones:', err)
      globalPool = null // Limpiar el pool en caso de error
    })

    connectionAttempts = 0 // Reset de intentos al conectar exitosamente
    return globalPool
  } catch (error) {
    // Manejo de reintentos en caso de error
    if (
      error instanceof Error &&
      (error.message.includes('timeout') || error.message.includes('limit')) &&
      connectionAttempts < MAX_RETRY_ATTEMPTS
    ) {
      connectionAttempts++
      console.warn(
        `⚠️  Error de conexión. Reintentando (${connectionAttempts}/${MAX_RETRY_ATTEMPTS})...`
      )
      await new Promise(resolve =>
        setTimeout(resolve, 1000 * connectionAttempts)
      ) // Backoff exponencial
      return getPool()
    }

    console.error('❌ Error al conectar a la base de datos:', error)
    throw error
  }
}

/**
 * Cierra el pool de conexiones global
 */
export const closeConnection = async (): Promise<void> => {
  if (globalPool) {
    try {
      await globalPool.close()
      console.log('✅ Pool de conexiones cerrado correctamente')
    } catch (error) {
      console.error('❌ Error al cerrar el pool:', error)
    } finally {
      globalPool = null
      connectionAttempts = 0
    }
  }
}

// ============================================================================
// SISTEMA DE CACHÉ
// ============================================================================

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class QueryCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private defaultTTL: number = 5 * 60 * 1000 // 5 minutos por defecto

  /**
   * Genera una clave única para la consulta
   */
  private generateKey(procedure: string, params?: Record<string, any>): string {
    const paramStr = params ? JSON.stringify(params) : ''
    return `${procedure}:${paramStr}`
  }

  /**
   * Obtiene datos del caché si están disponibles y no han expirado
   */
  get<T>(procedure: string, params?: Record<string, any>): T | null {
    const key = this.generateKey(procedure, params)
    const entry = this.cache.get(key)

    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    console.log(`📦 Cache HIT: ${procedure}`)
    return entry.data as T
  }

  /**
   * Guarda datos en el caché
   */
  set<T>(
    procedure: string,
    data: T,
    params?: Record<string, any>,
    ttl?: number
  ): void {
    const key = this.generateKey(procedure, params)
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    })
    console.log(`💾 Cache SET: ${procedure}`)
  }

  /**
   * Invalida el caché para un procedimiento específico
   */
  invalidate(procedure: string, params?: Record<string, any>): void {
    const key = this.generateKey(procedure, params)
    this.cache.delete(key)
    console.log(`🗑️  Cache INVALIDATE: ${procedure}`)
  }

  /**
   * Invalida todo el caché que coincida con un patrón
   */
  invalidatePattern(pattern: string): void {
    let count = 0
    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) {
        this.cache.delete(key)
        count++
      }
    }
    console.log(`🗑️  Cache INVALIDATE PATTERN: ${pattern} (${count} entries)`)
  }

  /**
   * Limpia todo el caché
   */
  clear(): void {
    this.cache.clear()
    console.log('🗑️  Cache CLEARED')
  }

  /**
   * Limpia entradas expiradas del caché
   */
  cleanup(): void {
    const now = Date.now()
    let count = 0
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        count++
      }
    }
    if (count > 0) {
      console.log(`🧹 Cache CLEANUP: ${count} expired entries removed`)
    }
  }
}

const queryCache = new QueryCache()

// Limpieza automática del caché cada 10 minutos
setInterval(() => queryCache.cleanup(), 10 * 60 * 1000)

// ============================================================================
// HELPERS PARA EJECUTAR QUERIES
// ============================================================================

export interface ExecuteOptions {
  useCache?: boolean
  cacheTTL?: number
  params?: Record<string, any>
}

/**
 * Ejecuta un stored procedure con manejo automático de conexiones y caché
 * @param procedure - Nombre del stored procedure
 * @param options - Opciones de ejecución (caché, TTL, parámetros)
 * @returns Promise con el resultado
 */
export const executeStoredProcedure = async <T = any>(
  procedure: string,
  options: ExecuteOptions = {}
): Promise<T> => {
  const { useCache = false, cacheTTL, params } = options

  try {
    // Intentar obtener del caché si está habilitado
    if (useCache) {
      const cachedData = queryCache.get<T>(procedure, params)
      if (cachedData !== null) {
        return cachedData
      }
    }

    // Obtener pool de conexiones
    const pool = await getPool()
    const request = pool.request()

    // Agregar parámetros si existen
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        request.input(key, value)
      }
    }

    // Ejecutar el stored procedure
    const result = await request.execute(procedure)
    const data = result.recordset as T

    // Guardar en caché si está habilitado
    if (useCache) {
      queryCache.set(procedure, data, params, cacheTTL)
    }

    return data
  } catch (error) {
    console.error(`❌ Error ejecutando ${procedure}:`, error)
    throw error
  }
}

/**
 * Ejecuta una query SQL directa con manejo automático de conexiones
 * @param query - Query SQL a ejecutar
 * @returns Promise con el resultado
 */
export const executeQuery = async <T = any>(query: string): Promise<T> => {
  try {
    const pool = await getPool()
    const result = await pool.request().query(query)
    return result.recordset as T
  } catch (error) {
    console.error('❌ Error ejecutando query:', error)
    throw error
  }
}

/**
 * Ejecuta una transacción con manejo automático
 * @param callback - Función que recibe la transacción
 * @returns Promise con el resultado
 */
export const executeTransaction = async <T = any>(
  callback: (transaction: sql.Transaction) => Promise<T>
): Promise<T> => {
  const pool = await getPool()
  const transaction = new sql.Transaction(pool)

  try {
    await transaction.begin()
    const result = await callback(transaction)
    await transaction.commit()
    return result
  } catch (error) {
    await transaction.rollback()
    console.error('❌ Error en transacción:', error)
    throw error
  }
}

// ============================================================================
// FUNCIONES DE UTILIDAD PARA CACHÉ
// ============================================================================

/**
 * Invalida el caché para un procedimiento específico
 */
export const invalidateCache = (
  procedure: string,
  params?: Record<string, any>
): void => {
  queryCache.invalidate(procedure, params)
}

/**
 * Invalida todo el caché que coincida con un patrón
 */
export const invalidateCachePattern = (pattern: string): void => {
  queryCache.invalidatePattern(pattern)
}

/**
 * Limpia todo el caché
 */
export const clearCache = (): void => {
  queryCache.clear()
}

// ============================================================================
// COMPATIBILIDAD CON CÓDIGO EXISTENTE
// ============================================================================

/**
 * @deprecated Usar executeStoredProcedure en su lugar
 * Mantiene compatibilidad con código existente
 */
export const getConnection2 = async (): Promise<sql.ConnectionPool> => {
  return getPool()
}
