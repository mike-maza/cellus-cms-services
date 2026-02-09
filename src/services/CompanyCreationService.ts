import { WebSocket } from 'ws'
import fs from 'fs'
import path from 'path'
import { executeQuery } from '../database/connection/index'

export class CompanyCreationService {
  private static readonly STEPS = [
    { id: 1, label: 'Inicializando creación de empresa...', delay: 1000 },
    { id: 2, label: 'Leyendo plantillas de definición...', delay: 1000 },
    { id: 3, label: 'Procesando esquema dinámico...', delay: 1000 },
    { id: 4, label: 'Generando tablas principales...', delay: 0 },
    { id: 5, label: 'Creando índices y optimizaciones...', delay: 0 },
    { id: 6, label: 'Creando procedimientos almacenados...', delay: 0 },
    { id: 7, label: 'Configurando triggers de auditoría...', delay: 0 },
    { id: 8, label: 'Finalizando configuración...', delay: 1000 }
  ]

  // List of tables extracted from tables.sql to consistency suffix across all files
  private static tablesToSuffix: string[] = []

  static async createCompanyStructure(socket: WebSocket, companyData: any) {
    const { name, representante } = companyData
    const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()

    try {
      const dbNameSuffix = sanitizedName

      for (const step of this.STEPS) {
        if (step.id === 2) {
          // Leyendo plantillas - Extract table names here
          await this.analyzeTemplates(socket, step.id)
        }

        if (step.id === 4) {
          // TABLES
          await this.processSqlFile(
            socket,
            step.id,
            'tables.sql',
            dbNameSuffix,
            'Creando tabla'
          )
          continue
        }
        if (step.id === 5) {
          // INDEXES
          await this.processSqlFile(
            socket,
            step.id,
            'indexs.sql',
            dbNameSuffix,
            'Creando índice'
          )
          continue
        }
        if (step.id === 6) {
          // SPs
          await this.processSqlFile(
            socket,
            step.id,
            'procedures.sql',
            dbNameSuffix,
            'Creando procedimiento'
          )
          continue
        }
        if (step.id === 7) {
          // TRIGGERS
          await this.processSqlFile(
            socket,
            step.id,
            'triggers.sql',
            dbNameSuffix,
            'Creando trigger'
          )
          continue
        }

        // Standard steps
        socket.send(
          JSON.stringify({
            action: 'create_company_progress',
            payload: {
              stepId: step.id,
              totalSteps: this.STEPS.length,
              message: step.label,
              timestamp: new Date().toISOString()
            }
          })
        )

        await new Promise(resolve => setTimeout(resolve, step.delay))
      }

      // Final success message
      socket.send(
        JSON.stringify({
          action: 'create_company_complete',
          payload: {
            success: true,
            message: `Empresa ${name} creada exitosamente.`,
            companyId: Math.floor(Math.random() * 1000)
          }
        })
      )
    } catch (error: any) {
      console.error('Error creating company:', error)
      socket.send(
        JSON.stringify({
          action: 'create_company_error',
          payload: {
            message: error.message || 'Error desconocido al crear la empresa.'
          }
        })
      )
    }
  }

  /**
   * Pre-reads tables.sql to identify which tables are being created.
   * Only these tables will be suffixed in subsequent steps.
   */
  private static async analyzeTemplates(socket: WebSocket, stepId: number) {
    try {
      const filePath = path.join(
        process.cwd(),
        'src',
        'migrations',
        'new_company',
        'tables.sql'
      )
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8')
        // Regex to find CREATE TABLE [dbo].[TableName] or CREATE TABLE TableName
        const matches = content.matchAll(
          /CREATE\s+TABLE\s+(?:\[dbo\]\.)?(?:\[)?([a-zA-Z0-9_]+)(?:\])?/gi
        )

        this.tablesToSuffix = []
        for (const match of matches) {
          if (match[2] && !this.tablesToSuffix.includes(match[2])) {
            this.tablesToSuffix.push(match[2])
          } else if (match[1] && !this.tablesToSuffix.includes(match[1])) {
            this.tablesToSuffix.push(match[1])
          }
        }
        // Sort by length desc to avoid partial replacement issues
        this.tablesToSuffix.sort((a, b) => b.length - a.length)

        console.log('Tables detected for suffixing:', this.tablesToSuffix)
      }
    } catch (e) {
      console.error('Error analyzing templates:', e)
    }
  }

  /**
   * Reads a SQL file, replaces object names with suffixed versions, and executes the blocks.
   */
  private static async processSqlFile(
    socket: WebSocket,
    stepId: number,
    filename: string,
    suffix: string,
    logPrefix: string
  ) {
    const filePath = path.join(
      process.cwd(),
      'src',
      'migrations',
      'new_company',
      filename
    )

    if (!fs.existsSync(filePath)) {
      console.warn(`Template file not found: ${filePath}`)
      socket.send(
        JSON.stringify({
          action: 'create_company_progress',
          payload: {
            stepId,
            message: `Advertencia: ${filename} no encontrado, saltando...`
          }
        })
      )
      return
    }

    let content = fs.readFileSync(filePath, 'utf-8')

    // 1. Global Replacement of Table Names based on analyzed list
    for (const table of this.tablesToSuffix) {
      // Replace [dbo].[Table]
      content = content.replace(
        new RegExp(`\\[dbo\\]\\.\\[${table}\\]`, 'gi'),
        `[dbo].[${table}_${suffix}]`
      )
      // Replace [Table]
      content = content.replace(
        new RegExp(`\\[${table}\\]`, 'gi'),
        `[${table}_${suffix}]`
      )
      // Replace " Table " (word boundaries) -> Be careful not to replace partials if not bracketed
      // Using \b boundary is safer.
      content = content.replace(
        new RegExp(`\\b${table}\\b`, 'g'),
        `${table}_${suffix}`
      )
    }

    // 2. Specific Replacement for Object Declarations matches (CREATE PROCEDURE sp_Name...)
    // This is dynamic based on what's being created

    // Suffix Procedures: sp_Name -> sp_Name_Suffix
    content = content.replace(
      /CREATE\s+OR\s+ALTER\s+PROCEDURE\s+([a-zA-Z0-9_]+)/gi,
      (match, p1) => {
        return `CREATE OR ALTER PROCEDURE ${p1}_${suffix}`
      }
    )

    // Suffix Triggers: TRIGGER trg_Name -> TRIGGER trg_Name_Suffix
    content = content.replace(
      /CREATE\s+OR\s+ALTER\s+TRIGGER\s+([a-zA-Z0-9_]+)/gi,
      (match, p1) => {
        return `CREATE OR ALTER TRIGGER ${p1}_${suffix}`
      }
    )

    // Suffix Indexes: INDEX IX_Name -> INDEX IX_Name_Suffix
    content = content.replace(
      /CREATE\s+NONCLUSTERED\s+INDEX\s+([a-zA-Z0-9_]+)/gi,
      (match, p1) => {
        return `CREATE NONCLUSTERED INDEX ${p1}_${suffix}`
      }
    )

    // Suffix Constraints (Constraints usually have complex naming in these files, mostly handled by TABLE replace inside identifiers,
    // but explicit constraints like UK_UserCompany might need suffix if valid global SQL)
    // For now, let's assume constraints inside CREATE TABLE are handled if they are unique enough or scoped to the table.
    // But global constraints (unique names) need suffixing.
    content = content.replace(/CONSTRAINT\s+([a-zA-Z0-9_]+)/gi, (match, p1) => {
      return `CONSTRAINT ${p1}_${suffix}`
    })

    // 3. Execution (Split by GO or empty lines?)
    // The provided files don't use 'GO' strictly everywhere, but we should handle it.
    // Standard T-SQL split
    const batches = content
      .split(/\nGO\n|\nGO\s|GO\n|^GO$/m)
      .map(b => b.trim())
      .filter(b => b.length > 0)

    let count = 0
    for (const batch of batches) {
      count++
      // Try to extract a name for logging
      let objectName = 'Item'
      const lines = batch.split('\n')
      // Check for CREATE something
      const createMatch = batch.match(
        /CREATE\s+(TABLE|PROCEDURE|TRIGGER|INDEX)\s+(?:\[dbo\]\.)?(?:\[)?([a-zA-Z0-9_]+)(?:\])?/i
      )
      if (createMatch && createMatch[2]) {
        objectName = createMatch[2]
      } else if (lines[0] && lines[0].startsWith('--')) {
        objectName = lines[0].replace(/[-=]/g, '').trim()
      }

      socket.send(
        JSON.stringify({
          action: 'create_company_progress',
          payload: {
            stepId,
            message: `${logPrefix}: ${objectName} (${count}/${batches.length})`,
            timestamp: new Date().toISOString()
          }
        })
      )

      try {
        await executeQuery(batch)
      } catch (e) {
        console.error(`Error executing batch for ${filename}:`, e)
        // Don't break loop, keep trying other objects
      }
      await new Promise(resolve => setTimeout(resolve, 300)) // Visual delay
    }

    // Create migration record file
    this.saveMigrationLog(suffix, filename, content)
  }

  private static saveMigrationLog(
    dbNameSuffix: string,
    originalFilename: string,
    content: string
  ) {
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '')
    const migrationFileName = `migration_${timestamp}_${dbNameSuffix}_${originalFilename}`
    const migrationPath = path.join(
      process.cwd(),
      'src',
      'database',
      'migrations',
      migrationFileName
    )

    const migrationDir = path.dirname(migrationPath)
    if (!fs.existsSync(migrationDir)) {
      fs.mkdirSync(migrationDir, { recursive: true })
    }
    fs.writeFileSync(migrationPath, content)
  }
}
