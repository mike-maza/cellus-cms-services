import fs from 'fs/promises'
import path from 'path'

export interface AuditLogEntry {
  timestamp: string
  userId?: string
  email?: string
  action: string
  payload?: any
  result: 'success' | 'error' | 'forbidden' | 'rate_limited'
  errorMessage?: string
  ip?: string
  userAgent?: string
}

export class WebSocketAuditLogger {
  private logFile: string
  private maxFileSize: number
  private maxFiles: number

  constructor(logDir = 'logs', maxFileSize = 10 * 1024 * 1024, maxFiles = 10) {
    this.logFile = path.join(logDir, 'websocket-audit.log')
    this.maxFileSize = maxFileSize
    this.maxFiles = maxFiles
    this.ensureLogDirectory(logDir)
  }

  private async ensureLogDirectory(logDir: string) {
    try {
      await fs.mkdir(logDir, { recursive: true })
    } catch (error) {
      console.error('Error creating log directory:', error)
    }
  }

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      const logLine = JSON.stringify(entry) + '\n'
      
      // Check file size and rotate if necessary
      await this.rotateIfNeeded()
      
      await fs.appendFile(this.logFile, logLine, 'utf8')
    } catch (error) {
      console.error('Error writing audit log:', error)
    }
  }

  private async rotateIfNeeded(): Promise<void> {
    try {
      const stats = await fs.stat(this.logFile).catch(() => null)
      if (stats && stats.size > this.maxFileSize) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const rotatedFile = `${this.logFile}.${timestamp}`
        await fs.rename(this.logFile, rotatedFile)
        
        // Clean up old files
        await this.cleanupOldFiles()
      }
    } catch (error) {
      console.error('Error rotating log file:', error)
    }
  }

  private async cleanupOldFiles(): Promise<void> {
    try {
      const logDir = path.dirname(this.logFile)
      const files = await fs.readdir(logDir)
      const logFiles = files
        .filter(f => f.startsWith('websocket-audit.log.'))
        .map(f => ({
          name: f,
          path: path.join(logDir, f)
        }))
      
      if (logFiles.length > this.maxFiles) {
        // Sort by name (timestamp is in the filename)
        logFiles.sort((a, b) => a.name.localeCompare(b.name))
        
        // Remove oldest files
        const filesToRemove = logFiles.slice(0, logFiles.length - this.maxFiles)
        for (const file of filesToRemove) {
          await fs.unlink(file.path).catch(() => {})
        }
      }
    } catch (error) {
      console.error('Error cleaning up old log files:', error)
    }
  }

  async getRecentLogs(limit = 100): Promise<AuditLogEntry[]> {
    try {
      const content = await fs.readFile(this.logFile, 'utf8').catch(() => '')
      const lines = content.split('\n').filter(line => line.trim())
      const logs = lines.slice(-limit).map(line => JSON.parse(line))
      return logs
    } catch (error) {
      console.error('Error reading audit logs:', error)
      return []
    }
  }
}

export const auditLogger = new WebSocketAuditLogger()