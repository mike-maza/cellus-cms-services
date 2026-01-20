interface Comentario {
  id: string
  autor: string
  rol: string
  mensaje: string
  fecha: string
}

interface SolicitudVacaciones {
  id: string
  empleadoId: string
  empleadoNombre: string
  empleadoAvatar: string
  empresaId: string
  tipo: 'vacaciones' | 'permiso' | 'suspension_medica' | 'ausencia'
  fechaInicio: string
  fechaFin: string
  diasSolicitados: number
  motivo: string
  estado: 'pendiente' | 'aprobada' | 'rechazada'
  fechaSolicitud: string
  aprobadoPor?: string
  comentarios?: string
  conversacion?: Comentario[]
}

// Datos simulados (Moviendo desde frontend)
let solicitudesVacacionesData: SolicitudVacaciones[] = [
  {
    id: 'VAC001',
    empleadoId: 'EMP001',
    empleadoNombre: 'María García',
    empleadoAvatar: 'MG',
    empresaId: 'EMP001',
    tipo: 'vacaciones',
    fechaInicio: '2024-03-15',
    fechaFin: '2024-03-22',
    diasSolicitados: 6,
    motivo: 'Vacaciones familiares',
    estado: 'pendiente',
    fechaSolicitud: '2024-02-01'
  },
  {
    id: 'VAC002',
    empleadoId: 'EMP002',
    empleadoNombre: 'Juan Pérez',
    empleadoAvatar: 'JP',
    empresaId: 'EMP001',
    tipo: 'permiso',
    fechaInicio: '2024-02-20',
    fechaFin: '2024-02-27',
    diasSolicitados: 6,
    motivo: 'Asuntos personales urgentes',
    estado: 'aprobada',
    fechaSolicitud: '2024-01-15',
    aprobadoPor: 'Admin Sistema',
    comentarios: 'Aprobado sin observaciones',
    conversacion: [
      {
        id: 'c1',
        autor: 'Juan Pérez',
        rol: 'Empleado',
        mensaje:
          'Solicitud de permiso del 20/02 al 27/02 por asuntos personales urgentes.',
        fecha: '2024-01-15T10:00:00Z'
      },
      {
        id: 'c2',
        autor: 'Admin Sistema',
        rol: 'Administrador',
        mensaje: 'Solicitud Aprobada',
        fecha: '2024-01-15T11:00:00Z'
      }
    ]
  },
  {
    id: 'VAC003',
    empleadoId: 'EMP003',
    empleadoNombre: 'Ana Rodríguez',
    empleadoAvatar: 'AR',
    empresaId: 'EMP002',
    tipo: 'suspension_medica',
    fechaInicio: '2024-04-01',
    fechaFin: '2024-04-15',
    diasSolicitados: 11,
    motivo: 'Reposo médico por cirugía menor',
    estado: 'aprobada',
    fechaSolicitud: '2024-01-20',
    aprobadoPor: 'Admin Sistema',
    comentarios: 'Aprobado con documentación médica',
    conversacion: [
      {
        id: 'c3',
        autor: 'Ana Rodríguez',
        rol: 'Empleado',
        mensaje:
          'Solicito suspensión médica del 1 al 15 de abril por cirugía menor.',
        fecha: '2024-01-20T09:00:00Z'
      },
      {
        id: 'c4',
        autor: 'Admin Sistema',
        rol: 'Administrador',
        mensaje: 'Solicitud Aprobada con documentación médica adjunta.',
        fecha: '2024-01-20T14:00:00Z'
      }
    ]
  },
  {
    id: 'VAC004',
    empleadoId: 'EMP004',
    empleadoNombre: 'Carlos López',
    empleadoAvatar: 'CL',
    empresaId: 'EMP001',
    tipo: 'ausencia',
    fechaInicio: '2024-05-10',
    fechaFin: '2024-05-17',
    diasSolicitados: 6,
    motivo: 'Ausencia justificada por motivos familiares',
    estado: 'pendiente',
    fechaSolicitud: '2024-02-05'
  }
]

export const getVacations = async () => {
  return solicitudesVacacionesData
}

export const createVacation = async (data: Omit<SolicitudVacaciones, 'id'>) => {
  const newVacation = {
    ...data,
    id: `VAC${Date.now()}`
  }
  solicitudesVacacionesData.push(newVacation)
  return newVacation
}

export const updateVacation = async (
  id: string,
  data: Partial<SolicitudVacaciones>
) => {
  const index = solicitudesVacacionesData.findIndex(v => v.id === id)
  if (index === -1) throw new Error('Vacation not found')

  solicitudesVacacionesData[index] = {
    ...solicitudesVacacionesData[index],
    ...data
  }
  return solicitudesVacacionesData[index]
}

export const addCommentToVacation = async (id: string, comment: Comentario) => {
  const index = solicitudesVacacionesData.findIndex(v => v.id === id)
  if (index === -1) throw new Error('Vacation not found')

  const vacation = solicitudesVacacionesData[index]
  const updatedConversacion = [...(vacation.conversacion || []), comment]

  solicitudesVacacionesData[index] = {
    ...vacation,
    conversacion: updatedConversacion
  }
  return solicitudesVacacionesData[index]
}
