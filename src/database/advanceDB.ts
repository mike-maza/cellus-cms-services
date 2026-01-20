interface AdvanceStep {
  id: string
  nombre: string
  estado: 'pendiente' | 'en-proceso' | 'completado'
  nivel: number
  aprobador?: string
  fecha?: string
  comentario?: string
}

interface Comentario {
  id: string
  autor: string
  rol: string
  mensaje: string
  fecha: string
}

interface SolicitudAnticipo {
  id: string
  empleado: string
  monto: number
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'pagado'
  fechaSolicitud: string
  motivo: string
  departamento: string
  cuotas: number
  cuotasPagadas: number
  pagoQuincenal: boolean
  pasosAprobacion: AdvanceStep[]
  conversacion?: Comentario[]
  fechaAprobacion?: string
  aprobadoPor?: string
}

let solicitudesAnticipos: SolicitudAnticipo[] = [
  {
    id: 'ANT001',
    empleado: 'María García',
    monto: 5000,
    estado: 'pendiente',
    fechaSolicitud: '2024-01-15',
    motivo: 'Gastos médicos urgentes para tratamiento',
    departamento: 'Ventas',
    cuotas: 6,
    cuotasPagadas: 0,
    pagoQuincenal: true,
    pasosAprobacion: [
      {
        id: 'paso1',
        nombre: 'Supervisor Directo',
        estado: 'pendiente',
        nivel: 1
      },
      {
        id: 'paso2',
        nombre: 'Gerente General',
        estado: 'pendiente',
        nivel: 2
      }
    ],
    conversacion: [
      {
        id: 'com1',
        autor: 'María García',
        rol: 'Empleado',
        mensaje: 'Solicito este anticipo para cubrir gastos médicos urgentes.',
        fecha: '2024-01-15T09:00:00'
      }
    ]
  },
  {
    id: 'ANT002',
    empleado: 'Carlos Rodríguez',
    monto: 3000,
    estado: 'pendiente',
    fechaSolicitud: '2024-01-20',
    motivo: 'Reparación de vehículo',
    departamento: 'IT',
    cuotas: 4,
    cuotasPagadas: 0,
    pagoQuincenal: false,
    pasosAprobacion: [
      {
        id: 'paso1',
        nombre: 'Supervisor Directo',
        estado: 'pendiente',
        nivel: 1
      },
      {
        id: 'paso2',
        nombre: 'Gerente General',
        estado: 'pendiente',
        nivel: 2
      }
    ],
    conversacion: [
      {
        id: 'com1',
        autor: 'Carlos Rodríguez',
        rol: 'Empleado',
        mensaje: 'Necesito reparar mi vehículo para poder asistir al trabajo.',
        fecha: '2024-01-20T10:30:00'
      }
    ]
  },
  {
    id: 'ANT003',
    empleado: 'Ana Martínez',
    monto: 7500,
    estado: 'aprobado',
    fechaSolicitud: '2024-01-25',
    motivo: 'Educación - Curso especialización',
    departamento: 'Recursos Humanos',
    cuotas: 12,
    cuotasPagadas: 3,
    pagoQuincenal: true,
    pasosAprobacion: [
      {
        id: 'paso1',
        nombre: 'Supervisor Directo',
        aprobador: 'Juan Sánchez',
        estado: 'completado',
        fecha: '2024-01-25T14:00:00',
        comentario: 'Aprobado',
        nivel: 1
      },
      {
        id: 'paso2',
        nombre: 'Gerente General',
        aprobador: 'Admin Sistema',
        estado: 'completado',
        fecha: '2024-01-26T09:30:00',
        comentario: 'Aprobado por emergencia médica',
        nivel: 2
      }
    ],
    conversacion: [
      {
        id: 'com1',
        autor: 'Ana Martínez',
        rol: 'Empleado',
        mensaje: 'Solicito anticipo para curso de especialización profesional',
        fecha: '2024-01-25T11:00:00'
      },
      {
        id: 'com2',
        autor: 'Admin Sistema',
        rol: 'Gerente General',
        mensaje:
          'El monto solicitado excede el límite permitido de 50,000. Por favor, ajusta tu solicitud.',
        fecha: '2024-01-26T10:00:00'
      }
    ]
  },
  {
    id: 'ANT004',
    empleado: 'Carlos López',
    monto: 2500,
    estado: 'pagado',
    fechaSolicitud: '2023-12-01',
    motivo: 'Gastos familiares',
    departamento: 'Marketing',
    cuotas: 2,
    cuotasPagadas: 2,
    pagoQuincenal: false,
    pasosAprobacion: [
      {
        id: 'paso1',
        nombre: 'Supervisor Directo',
        aprobador: 'María Torres',
        estado: 'completado',
        fecha: '2023-12-01T14:00:00',
        nivel: 1
      },
      {
        id: 'paso2',
        nombre: 'Gerente General',
        aprobador: 'Admin Sistema',
        estado: 'completado',
        fecha: '2023-12-02T10:00:00',
        nivel: 2
      }
    ],
    conversacion: [
      {
        id: 'com1',
        autor: 'Carlos López',
        rol: 'Empleado',
        mensaje: 'Solicito anticipo para gastos familiares urgentes',
        fecha: '2023-12-01T09:00:00'
      }
    ]
  }
]

export const getAdvances = async () => {
  return solicitudesAnticipos
}

export const createAdvance = async (data: Omit<SolicitudAnticipo, 'id'>) => {
  const newAdvance = {
    ...data,
    id: `ANT${Date.now()}`
  }
  solicitudesAnticipos.push(newAdvance)
  return newAdvance
}

export const updateAdvance = async (
  id: string,
  data: Partial<SolicitudAnticipo>
) => {
  const index = solicitudesAnticipos.findIndex(a => a.id === id)
  if (index === -1) throw new Error('Advance not found')

  solicitudesAnticipos[index] = {
    ...solicitudesAnticipos[index],
    ...data
  }
  return solicitudesAnticipos[index]
}
