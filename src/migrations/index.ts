import fs from 'fs';
import path from 'path';
import sql from 'mssql';
import config from '../configDatabase';

// Configuración de la conexión a SQL Server
const sqlConfig = {
  user: config.dbUser,
  password: config.dbPassword,
  server: config.dbServer,
  port: Number(config.dbPort),
  database: config.dbDatabase,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

/**
 * Ejecuta todas las migraciones pendientes
 */
async function runMigrations() {
  try {
    console.log('Conectando a la base de datos...');
    const pool = await sql.connect(sqlConfig);
    
    // Verificar si la tabla de migraciones existe
    const checkTableResult = await pool.request().query(`
      SELECT OBJECT_ID('dbo.migrations') as TableExists
    `);
    
    const tableExists = checkTableResult.recordset[0].TableExists !== null;
    
    if (!tableExists) {
      console.log('La tabla de migraciones no existe. Ejecutando la primera migración...');
      // Ejecutar la primera migración que crea la tabla de migraciones
      const firstMigrationPath = path.join(__dirname, 'scripts', '001_create_tables.sql');
      const firstMigrationSql = fs.readFileSync(firstMigrationPath, 'utf8');
      await pool.request().batch(firstMigrationSql);
    }
    
    // Obtener las migraciones ya ejecutadas
    const executedMigrations = await pool.request().query(`
      SELECT name FROM dbo.migrations
    `);
    
    const executedMigrationNames = executedMigrations.recordset.map(row => row.name);
    
    // Leer todos los archivos de migración
    const scriptsDir = path.join(__dirname, 'scripts');
    const migrationFiles = fs.readdirSync(scriptsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ordenar alfabéticamente para asegurar el orden correcto
    
    // Ejecutar las migraciones pendientes
    for (const file of migrationFiles) {
      const migrationName = path.basename(file, '.sql');
      
      if (!executedMigrationNames.includes(migrationName)) {
        console.log(`Ejecutando migración: ${migrationName}`);
        const migrationPath = path.join(scriptsDir, file);
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');
        
        try {
          await pool.request().batch(migrationSql);
          console.log(`Migración ${migrationName} ejecutada correctamente`);
        } catch (error) {
          console.error(`Error al ejecutar la migración ${migrationName}:`, error);
          throw error;
        }
      } else {
        console.log(`Migración ${migrationName} ya fue ejecutada anteriormente`);
      }
    }
    
    console.log('Todas las migraciones han sido ejecutadas correctamente');
    await pool.close();
    
  } catch (error) {
    console.error('Error al ejecutar las migraciones:', error);
    process.exit(1);
  }
}

// Ejecutar las migraciones si este archivo se ejecuta directamente
if (require.main === module) {
  runMigrations();
}

export default runMigrations;