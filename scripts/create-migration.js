const fs = require('fs');
const path = require('path');

// Obtener el nombre de la migración desde los argumentos de la línea de comandos
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Por favor proporciona un nombre para la migración');
  console.error('Ejemplo: npm run migrate:create -- create_users_table');
  process.exit(1);
}

const migrationName = args[0];

// Obtener la fecha actual para el prefijo del archivo
const now = new Date();
const timestamp = now.toISOString().split('T')[0].replace(/-/g, '');

// Obtener el número de secuencia para la migración
const scriptsDir = path.join(__dirname, '../src/migrations/scripts');
const files = fs.readdirSync(scriptsDir).filter(file => file.endsWith('.sql'));
const lastFile = files.sort().pop();
let sequence = 1;

if (lastFile) {
  const match = lastFile.match(/^(\d{3})_/);
  if (match) {
    sequence = parseInt(match[1], 10) + 1;
  }
}

// Formatear el número de secuencia con ceros a la izquierda
const sequenceStr = sequence.toString().padStart(3, '0');

// Crear el nombre del archivo de migración
const fileName = `${sequenceStr}_${migrationName}.sql`;
const filePath = path.join(scriptsDir, fileName);

// Contenido de la plantilla de migración
const migrationContent = `-- Migración ${sequenceStr}: ${migrationName}
-- Fecha: ${now.toISOString().split('T')[0]}

-- Escribe aquí tus sentencias SQL

-- Registrar esta migración
INSERT INTO [dbo].[migrations] ([name]) VALUES ('${sequenceStr}_${migrationName}');`;

// Escribir el archivo de migración
fs.writeFileSync(filePath, migrationContent);

console.log(`Migración creada: ${filePath}`);