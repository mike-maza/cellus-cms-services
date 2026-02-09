export const COMPANY_SPREADSHEETS: Record<string, string> = {
  CELLUS: process.env.GOOGLE_SHEET_ID_CELLUS || '',
  CLARITY: process.env.GOOGLE_SHEET_ID_CELLUS || '',
  SEGNI: process.env.GOOGLE_SHEET_ID_CELLUS || ''
}

export const SHEETS = {
  //   EMPLOYEES: 'EMPLEADOS'
  EMPLOYEES: process.env.GOOGLE_SHEET_NAME_EMPLOYEES || ''
}

export const COLUMNS = {
  COD_EMPLOYEE: 'Codigo de empleado',
  EMAIL: 'Correo'
}

export const DB_TO_SHEET_COLUMNS: Record<string, string> = {
  CodEmployee: 'Codigo de empleado',
  FullName: 'Nombres Y Apellidos',
  DischargeDate: 'Fecha De Ingreso',
  LowDate: 'Fecha De Baja',
  Email: 'Correo',
  CorporateNumber: 'Números Corporativos',
  UserStatus: 'Estatus',
  Department: 'Rol', // Verificar header en sheet si es diferente
  Position: 'Puesto',
  Cdr: 'CDR',
  Account: 'Cuenta',
  NoAccount: 'No. Cuenta',
  ImmediateBoss: 'Jefe Inmediato',
  DPI: 'DPI',
  NIT: 'NIT',
  IGSS: 'IGSS',
  Company: 'Empresa',
  TotalVacations: 'Total de Vacaciones' // Si existe
}
