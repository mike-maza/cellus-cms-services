import { WebSocket } from 'ws'

export type ProcessStatus = 'running' | 'completed' | 'failed'

export interface ProcessLog {
  timestamp: string
  message: string
  type: 'info' | 'error' | 'success'
}

export interface BackgroundProcess {
  id: string
  action: string
  userName: string
  userEmail: string
  status: ProcessStatus
  progress: number // 0 to 100
  total: number
  current: number
  logs: ProcessLog[]
  itemResults?: Record<
    string,
    { status: 'success' | 'error' | 'pending'; message: string | undefined }
  >
  startTime: string
  endTime?: string
}

class ProcessManagerService {
  private processes: Map<string, BackgroundProcess> = new Map()
  private readonly HISTORY_LIMIT_MS = 60 * 60 * 1000 // 1 hour

  constructor() {
    // Periodically clean up old processes
    setInterval(() => this.cleanup(), 5 * 60 * 1000)
  }

  startProcess(
    action: string,
    user: { name?: string; email?: string; sub?: string },
    total: number
  ): BackgroundProcess {
    const id = `proc_${Date.now()}`
    const process: BackgroundProcess = {
      id,
      action,
      userName: user.name || user.email || user.sub || 'Unknown User',
      userEmail: user.email || user.sub || 'unknown',
      status: 'running',
      progress: 0,
      total,
      current: 0,
      logs: [],
      itemResults: {},
      startTime: new Date().toISOString()
    }

    process.logs.push({
      timestamp: process.startTime,
      message: `🚀 Proceso iniciado: "${action}" para ${total} elementos.`,
      type: 'info'
    })

    this.processes.set(id, process)
    return process
  }

  updateProgress(id: string, current: number, message?: string) {
    const process = this.processes.get(id)
    if (!process) return

    process.current = current
    process.progress = Math.round((current / process.total) * 100)

    if (message) {
      this.addLog(id, message, 'info')
    }

    if (current >= process.total) {
      this.finishProcess(id, 'completed')
    }
  }

  updateItemStatus(
    id: string,
    itemId: string,
    status: 'success' | 'error',
    message: string | undefined
  ) {
    const process = this.processes.get(id)
    if (!process) return
    if (!process.itemResults) process.itemResults = {}

    process.itemResults[itemId] = { status, message }
  }

  addLog(
    id: string,
    message: string,
    type: 'info' | 'error' | 'success' = 'info'
  ) {
    const process = this.processes.get(id)
    if (!process) return

    process.logs.push({
      timestamp: new Date().toISOString(),
      message,
      type
    })
  }

  finishProcess(id: string, status: ProcessStatus, finalMessage?: string) {
    const process = this.processes.get(id)
    if (!process) return

    process.status = status
    process.endTime = new Date().toISOString()
    process.progress = 100

    if (finalMessage) {
      this.addLog(
        id,
        finalMessage,
        status === 'completed' ? 'success' : 'error'
      )
    } else {
      this.addLog(
        id,
        status === 'completed'
          ? 'Proceso finalizado exitosamente.'
          : 'Proceso fallido.',
        status === 'completed' ? 'success' : 'error'
      )
    }
  }

  getProcess(id: string): BackgroundProcess | undefined {
    return this.processes.get(id)
  }

  getAllActive(): BackgroundProcess[] {
    return Array.from(this.processes.values()).filter(
      p => p.status === 'running'
    )
  }

  getRecentHistory(): BackgroundProcess[] {
    const now = Date.now()
    return Array.from(this.processes.values())
      .filter(p => p.status !== 'running')
      .filter(p => {
        if (!p.endTime) return false
        return now - new Date(p.endTime).getTime() < this.HISTORY_LIMIT_MS
      })
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      )
  }

  private cleanup() {
    const now = Date.now()
    for (const [id, p] of this.processes.entries()) {
      if (p.status !== 'running' && p.endTime) {
        if (now - new Date(p.endTime).getTime() > this.HISTORY_LIMIT_MS) {
          this.processes.delete(id)
        }
      }
    }
  }
}

export const processManager = new ProcessManagerService()
