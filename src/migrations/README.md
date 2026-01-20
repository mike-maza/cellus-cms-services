# Sistema de Migraciones para SQL Server

Este sistema permite gestionar migraciones de base de datos para SQL Server de manera ordenada y controlada.

## Estructura

- `src/migrations/index.ts`: Script principal para ejecutar las migraciones
- `src/migrations/scripts/`: Directorio con los scripts SQL de migración
- `scripts/create-migration.js`: Utilidad para crear nuevas migraciones

## Comandos disponibles

### Ejecutar migraciones

Para ejecutar todas las migraciones pendientes:

```bash
npm run migrate
```

### Crear una nueva migración

Para crear un nuevo archivo de migración:

```bash
npm run migrate:create -- nombre_de_la_migracion
```

Por ejemplo:

```bash
npm run migrate:create -- add_column_to_users
```

Esto creará un nuevo archivo en `src/migrations/scripts/` con el formato `XXX_nombre_de_la_migracion.sql`.

## Formato de los archivos de migración

Cada archivo de migración debe seguir este formato:

```sql
-- Migración XXX: Descripción
-- Fecha: YYYY-MM-DD

-- Tus sentencias SQL aquí

-- Registrar esta migración
INSERT INTO [dbo].[migrations] ([name]) VALUES ('XXX_nombre_de_la_migracion');
```

## Buenas prácticas

1. Cada migración debe ser idempotente (se puede ejecutar múltiples veces sin causar errores)
2. Usa verificaciones como `IF NOT EXISTS` para evitar errores
3. Incluye comentarios descriptivos en tus migraciones
4. Mantén las migraciones pequeñas y enfocadas en un solo cambio
5. No modifiques migraciones ya ejecutadas, crea nuevas para corregir problemas

## Tabla de control

El sistema utiliza una tabla `migrations` para llevar el control de las migraciones ejecutadas:

```sql
CREATE TABLE [dbo].[migrations] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [name] NVARCHAR(255) NOT NULL,
    [executed_at] DATETIME NOT NULL DEFAULT GETDATE()
);
```