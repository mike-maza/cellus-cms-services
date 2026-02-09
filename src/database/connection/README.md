# 🚀 Sistema de Conexión a Base de Datos Mejorado

## 📋 Características Principales

✅ **Pool de conexiones optimizado** con manejo automático de recursos  
✅ **Sistema de caché integrado** para reducir consultas repetidas  
✅ **Cierre automático** de conexiones inactivas  
✅ **Helpers simplificados** para ejecutar queries  
✅ **Manejo de transacciones** con rollback automático  
✅ **Reintentos automáticos** en caso de errores temporales  
✅ **Compatibilidad** con código existente

---

## 🎯 Uso Básico

### 1. Ejecutar Stored Procedure Simple

```typescript
import { executeStoredProcedure } from '~/database/connection'

const users = await executeStoredProcedure<Users[]>('get_Users')
```

### 2. Ejecutar con Caché (Recomendado para datos estáticos)

```typescript
const companies = await executeStoredProcedure<Company[]>('get_Companies', {
  useCache: true,
  cacheTTL: 10 * 60 * 1000 // 10 minutos
})
```

### 3. Ejecutar con Parámetros

```typescript
const user = await executeStoredProcedure<User[]>('get_UserById', {
  useCache: true,
  cacheTTL: 5 * 60 * 1000,
  params: {
    UserId: '12345'
  }
})
```

### 4. Ejecutar Query SQL Directa

```typescript
import { executeQuery } from '~/database/connection'

const data = await executeQuery(`
  SELECT * FROM Users WHERE IsActive = 1
`)
```

### 5. Ejecutar Transacción

```typescript
import { executeTransaction } from '~/database/connection'

const result = await executeTransaction(async transaction => {
  const userResult = await transaction
    .request()
    .input('Name', 'Juan')
    .execute('insert_User')

  const userId = userResult.recordset[0].UserId

  await transaction.request().input('UserId', userId).execute('insert_UserRole')

  return userId
})
```

---

## 💾 Gestión de Caché

### Invalidar Caché Específico

```typescript
import { invalidateCache } from '~/database/connection'

// Después de actualizar un usuario
await executeStoredProcedure('update_User', { params: { UserId: '123' } })
invalidateCache('get_UserById', { UserId: '123' })
```

### Invalidar por Patrón

```typescript
import { invalidateCachePattern } from '~/database/connection'

// Invalida todos los cachés que empiecen con "get_User"
invalidateCachePattern('get_User')
```

### Limpiar Todo el Caché

```typescript
import { clearCache } from '~/database/connection'

clearCache()
```

---

## 🔧 Configuración

El sistema está configurado con valores óptimos por defecto:

```typescript
MAX_CONNECTIONS_BURST = 20 // Máximo de conexiones simultáneas
IDLE_TIMEOUT_MS = 30000 // 30 segundos antes de cerrar conexiones inactivas
REQUEST_TIMEOUT_MS = 15000 // 15 segundos timeout por request
DEFAULT_CACHE_TTL = 5 * 60 * 1000 // 5 minutos de caché por defecto
```

---

## 🎨 Patrones Recomendados

### ✅ Para Datos que Cambian Frecuentemente (NO usar caché)

```typescript
export const getActiveOrders = async () => {
  return executeStoredProcedure('get_ActiveOrders')
}
```

### ✅ Para Catálogos/Configuraciones (SÍ usar caché)

```typescript
export const getCountries = async () => {
  return executeStoredProcedure('get_Countries', {
    useCache: true,
    cacheTTL: 30 * 60 * 1000 // 30 minutos
  })
}
```

### ✅ Para Operaciones de Escritura (Invalidar caché)

```typescript
export const createUser = async (userData: any) => {
  const result = await executeStoredProcedure('insert_User', {
    params: userData
  })

  // Invalidar cachés relacionados
  invalidateCachePattern('get_User')

  return result
}
```

---

## 🔄 Migración desde Código Antiguo

### Antes:

```typescript
import { getConnection2 } from '~/database/connection'

export const getAllUsers = async () => {
  const pool = await getConnection2()
  const result = await pool.request().execute('get_Users')
  return result.recordset
}
```

### Después:

```typescript
import { executeStoredProcedure } from '~/database/connection'

export const getAllUsers = async () => {
  return executeStoredProcedure('get_Users', {
    useCache: true,
    cacheTTL: 5 * 60 * 1000
  })
}
```

---

## 📊 Beneficios

| Característica        | Antes     | Ahora                    |
| --------------------- | --------- | ------------------------ |
| **Caché**             | ❌ No     | ✅ Sí (configurable)     |
| **Cierre automático** | ❌ No     | ✅ Sí (30s inactivo)     |
| **Código por query**  | ~6 líneas | ~3 líneas                |
| **Manejo de errores** | Manual    | ✅ Automático            |
| **Reintentos**        | ❌ No     | ✅ Sí (3 intentos)       |
| **Transacciones**     | Manual    | ✅ Helper incluido       |
| **Logs**              | Básicos   | ✅ Detallados con emojis |

---

## 🚨 Notas Importantes

1. **El caché se limpia automáticamente** cada 10 minutos para eliminar entradas expiradas
2. **Las conexiones inactivas se cierran** después de 30 segundos
3. **El pool se reutiliza** entre requests para mejor rendimiento
4. **Los errores se reintentan** hasta 3 veces con backoff exponencial
5. **Compatibilidad mantenida**: `getConnection2()` sigue funcionando

---

## 🐛 Troubleshooting

### El caché no se está invalidando

```typescript
// Asegúrate de invalidar después de operaciones de escritura
await executeStoredProcedure('update_User', { params: { UserId: '123' } })
invalidateCache('get_UserById', { UserId: '123' })
```

### Demasiadas conexiones abiertas

```typescript
// El sistema las cierra automáticamente después de 30s
// Si necesitas cerrar manualmente:
import { closeConnection } from '~/database/connection'
await closeConnection()
```

### Queries lentas

```typescript
// Usa caché para queries frecuentes:
executeStoredProcedure('get_Data', {
  useCache: true,
  cacheTTL: 10 * 60 * 1000 // 10 minutos
})
```

---

## 📝 Ejemplos Completos

Ver archivo: `src/database/connection/examples.ts`
