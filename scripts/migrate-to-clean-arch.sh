#!/bin/bash

echo "🚀 Iniciando migración a Clean Architecture..."

# Crear backup
echo "📦 Creando backup..."
timestamp=$(date +%Y%m%d_%H%M%S)
git checkout -b "migrate/clean-arch-$timestamp" 2>/dev/null || git checkout -b "migrate/clean-arch"
cp -r . "../cellus-cms-services-backup-$timestamp"

# Función para mover archivos con backup
move_with_backup() {
    local src="$1"
    local dest="$2"
    
    if [ -e "$src" ]; then
        echo "📁 Moviendo: $src -> $dest"
        mkdir -p "$(dirname "$dest")"
        cp -r "$src" "$dest"
    fi
}

# Mover archivos existentes a nueva estructura
echo "🔄 Reorganizando estructura existente..."

# Configuración
if [ -d "src/config" ]; then
    move_with_backup "src/config" "src/presentation/http/config-old"
fi

# Middleware
if [ -d "src/middleware" ]; then
    move_with_backup "src/middleware" "src/presentation/http/middleware"
fi

# Rutas
if [ -d "src/routes" ]; then
    move_with_backup "src/routes" "src/presentation/http/routes"
fi

# Servicios
if [ -d "src/services" ]; then
    move_with_backup "src/services" "src/application/services"
fi

# Base de datos
if [ -d "src/database" ]; then
    move_with_backup "src/database" "src/infrastructure/database"
fi

# Tests
if [ -d "src/__tests__" ]; then
    move_with_backup "src/__tests__" "src/tests"
fi

# Crear estructura restante
echo "📂 Creando estructura de directorios..."
mkdir -p src/{core/{domain/{entities,value-objects,enums,events,contracts},shared/{errors,utils}},infrastructure/{database/{connections,repositories,procedures,migrations},external/{email,storage,2fa},logging,cache},application/{use-cases/{auth,users,two-factor,employees},dto/{requests,responses},services,validators},presentation/{http/{controllers,middleware,routes,server},websocket},config/{environments,database,app,security},tests/{unit,application,infrastructure,presentation,integration,e2e,fixtures,mocks,setup},docs/{api,architecture,deployment,development},utils/{date,string,file},types}

echo "✅ Estructura creada exitosamente!"
echo ""
echo "📝 Siguientes pasos:"
echo "1. Revisa los archivos movidos"
echo "2. Crea los controllers separando la lógica de las rutas"
echo "3. Implementa los use cases para cada funcionalidad"
echo "4. Actualiza los imports en todos los archivos"
echo "5. Ejecuta: npm run build para verificar que todo compile"
echo ""
echo "🔗 El backup está en: ../cellus-cms-services-backup-$timestamp"