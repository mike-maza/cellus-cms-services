# ============================================
# Dockerfile Optimizado para Cellus Payments API
# Multi-stage build para producción
# ============================================

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:22-alpine AS dependencies

# Metadata
LABEL maintainer="Cellus Development Team"
LABEL description="Cellus Payments Services API"
LABEL version="2.0.0"

# Establecer zona horaria
ENV TZ="America/Guatemala"

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache \
    openssl \
    openssl-dev \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm@latest

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar SOLO dependencias de producción
RUN pnpm install --frozen-lockfile --prod

# ============================================
# Stage 2: Build
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm@latest

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar TODAS las dependencias (incluyendo devDependencies)
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY . .

# Compilar TypeScript (si tienes un script de build)
# RUN pnpm run build

# ============================================
# Stage 3: Production
# ============================================
FROM node:22-alpine AS production

# Establecer zona horaria
ENV TZ="America/Guatemala"

# Variables de entorno para Node.js
ENV NODE_ENV=production
ENV NODE_OPTIONS="--openssl-legacy-provider"
ENV OPENSSL_CONF=/dev/null

# Instalar solo dependencias runtime necesarias
RUN apk add --no-cache \
    openssl \
    openssl-dev \
    dumb-init \
    tzdata \
    && cp /usr/share/zoneinfo/America/Guatemala /etc/localtime \
    && echo "America/Guatemala" > /etc/timezone \
    && rm -rf /var/cache/apk/*

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm@latest

# Copiar dependencias de producción desde stage 1
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copiar código fuente
COPY --chown=nodejs:nodejs . .

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 4000

ENV NODE_OPTIONS="--openssl-legacy-provider"
ENV OPENSSL_CONF=/dev/null

# Health check
# HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
#     CMD node -e "require('http').get('http://localhost:5001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Usar dumb-init para manejar señales correctamente
ENTRYPOINT ["dumb-init", "--"]

# Comando de inicio
CMD ["pnpm", "start"]