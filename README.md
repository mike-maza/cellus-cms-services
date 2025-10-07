# Secure API Service

Un servicio API completo y seguro construido con Node.js, TypeScript y Express, enfocado en las mejores prácticas de seguridad.

## 🚀 Características

### Seguridad
- **Better-Auth** para autenticación moderna y segura
- **Autenticación de dos factores (2FA)** con TOTP y códigos de respaldo
- **Gestión de sesiones** avanzada con revocación
- **Rate limiting** y speed limiting
- **Validación exhaustiva** de entrada con express-validator
- **Sanitización** de datos de entrada
- **Helmet** para headers de seguridad
- **Argon2** para hash de contraseñas (integrado en better-auth)
- **Detección de ataques** comunes (XSS, SQL Injection)
- **Logs de seguridad** detallados

### Funcionalidades
- **Gestión de usuarios** completa
- **Subida de archivos** a Google Cloud Storage
- **Validación de archivos** por tipo y tamaño
- **Múltiples archivos** por request
- **Enlaces compartidos** temporales
- **Documentación Swagger** automática
- **Base de datos SQL Server** con procedimientos almacenados
- **Email notifications** con Nodemailer

### Arquitectura
- **TypeScript** para type safety
- **Middleware modular** y reutilizable
- **Manejo de errores** centralizado
- **Validación en capas** múltiples
- **Configuración por variables de entorno**
- **Graceful shutdown** y cleanup automático

## 📋 Requisitos

- Node.js 18+
- SQL Server 2019+
- Cuenta de Google Cloud Storage
- Servidor SMTP para emails

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd secure-api-service
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_SERVER=localhost
DB_DATABASE=secure_api_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_PORT=1433
DB_ENCRYPT=true

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Google Cloud Storage
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_BUCKET_NAME=your-bucket-name
GOOGLE_CLOUD_KEY_FILE=path/to/service-account-key.json

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000
```

4. **Configurar base de datos**
```bash
# Ejecutar el script SQL en tu servidor SQL Server
# src/database/schema.sql
```

5. **Compilar TypeScript**
```bash
npm run build
```

6. **Iniciar en desarrollo**
```bash
npm run dev
```

7. **Iniciar en producción**
```bash
npm start
```

## 📚 Documentación API

Una vez iniciado el servidor, la documentación Swagger estará disponible en:
- **Desarrollo**: http://localhost:3000/api-docs
- **Producción**: https://tu-dominio.com/api-docs

## 🔐 Endpoints Principales

### Autenticación (Better-Auth)
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/session` - Obtener sesión actual
- `POST /api/auth/verify-email` - Verificar email
- `POST /api/auth/forgot-password` - Solicitar reset de contraseña
- `POST /api/auth/reset-password` - Restablecer contraseña
- `POST /api/auth/enable-2fa` - Habilitar 2FA
- `POST /api/auth/verify-2fa` - Verificar código 2FA
- `POST /api/auth/disable-2fa` - Deshabilitar 2FA

### Usuarios
- `GET /api/users/profile` - Obtener perfil
- `PUT /api/users/profile` - Actualizar perfil
- `PUT /api/users/change-password` - Cambiar contraseña
- `POST /api/users/regenerate-backup-codes` - Regenerar códigos de respaldo
- `GET /api/users/sessions` - Obtener sesiones activas
- `DELETE /api/users/sessions/:id` - Revocar sesión específica
- `DELETE /api/users/sessions` - Revocar todas las sesiones
- `GET /api/users/stats` - Obtener estadísticas
- `DELETE /api/users/account` - Eliminar cuenta

### Archivos
- `POST /api/files/upload` - Subir archivo
- `POST /api/files/upload-multiple` - Subir múltiples archivos
- `GET /api/files` - Listar archivos
- `GET /api/files/:id` - Obtener archivo
- `DELETE /api/files/:id` - Eliminar archivo
- `GET /api/files/:id/download` - Descargar archivo
- `POST /api/files/:id/share` - Compartir archivo

## 🔒 Medidas de Seguridad Implementadas

### Autenticación y Autorización
- **Better-Auth** con sesiones seguras
- Verificación de email obligatoria
- 2FA con TOTP (Google Authenticator compatible)
- Códigos de respaldo para 2FA
- Gestión avanzada de sesiones
- Rate limiting integrado

### Validación y Sanitización
- Validación exhaustiva con express-validator
- Sanitización de entrada de datos
- Validación de tipos MIME para archivos
- Límites de tamaño de archivos
- Validación de profundidad de objetos JSON
- Detección de patrones de ataque

### Rate Limiting
- Rate limiting general: 100 requests/15min
- Rate limiting de autenticación: 5 attempts/15min
- Rate limiting de registro: 3 registrations/hour
- Rate limiting de archivos: 10 uploads/15min
- Speed limiting progresivo

### Headers de Seguridad
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

### Base de Datos
- Consultas parametrizadas (previene SQL injection)
- Procedimientos almacenados
- Índices optimizados
- Triggers para auditoría
- Cleanup automático de datos expirados

### Archivos
- Validación de tipos MIME
- Límites de tamaño por tipo
- Nombres de archivo únicos y seguros
- Almacenamiento en Google Cloud Storage
- URLs firmadas para acceso temporal

## 🚀 Despliegue en Producción

### Variables de Entorno Adicionales
```env
NODE_ENV=production
FRONTEND_URL=https://tu-frontend.com
```

### Consideraciones de Seguridad
1. **HTTPS obligatorio** en producción
2. **Firewall** configurado correctamente
3. **Monitoreo** de logs de seguridad
4. **Backups** regulares de base de datos
5. **Rotación** de secrets y keys
6. **Actualizaciones** regulares de dependencias

### Docker (Opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

## 🧪 Testing

El proyecto incluye una suite completa de tests con alta cobertura:

### Tipos de Tests
- **Tests Unitarios**: Funciones y clases individuales
- **Tests de Integración**: Interacción entre componentes
- **Tests End-to-End**: Flujos completos de usuario

### Comandos de Testing
```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Coverage completo
npm run test:coverage

# Solo tests unitarios
npm run test:unit

# Solo tests de integración
npm run test:integration
```

### Cobertura de Tests
- **Branches**: 70%+
- **Functions**: 70%+
- **Lines**: 70%+
- **Statements**: 70%+

### Componentes Testeados
- ✅ Utilidades de encriptación y validación
- ✅ Middlewares de seguridad y autenticación
- ✅ Controladores de auth, usuarios y archivos
- ✅ Servicios de 2FA y email
- ✅ Helpers de better-auth
- ✅ Flujos completos de autenticación
- ✅ Gestión de sesiones y archivos

## 📝 Logs

Los logs se generan automáticamente para:
- Errores de aplicación
- Intentos de autenticación
- Actividad sospechosa
- Subida/descarga de archivos
- Cambios de configuración de seguridad

## 🤝 Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 🆘 Soporte

Para soporte técnico o reportar vulnerabilidades de seguridad, contacta a: support@example.com