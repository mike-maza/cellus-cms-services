export type SheetConfig = {
  spreadsheetId: string
  range: string
}

export type CloudStorageConfig = {
  projectId: string
  keyFilename: string
  clientEmail?: string
  privateKey?: string
}

type CompaniesData = {
  Name: string
  ShortName: string
  PrimaryColor: string
  TextColor: string
  LogoPath: string
}

export type Companies = {
  GroupName: CompaniesData[]
}

export type Users = {
  FirstName: string
  LastName: string
  Email: string
  Password: string
  Role: string
  Enabled: boolean
  CompanyId: number
  TwoFactorEnabled: boolean
}

export type UserPermissions = {
  UserId: number
  PermissionId: number
}

export type UserSteps = {
  UserId: number
  StepName: string
  Completed: boolean
}

export type UserTwoFactor = {
  UserId: number
  Employee: number
  Token: string
}

export type BITACORA_TICKETS = {
  CodEmployee: string
  FullName: string
  SheetName: string
  NoBoleta: string
  PaymentIndicator: string
  PayDay: string
  UiAuthorization: string
  Comments?: string
  BiweeklyAdvance: string
  TotalOvertime: string
  Bonus?: string
  Bonus79?: string
  TotalBiweeklyToPay: string
  TotalDeductions: string
  Total: string
  AmountDays: string
  DAY: string
  MONTH: string
  YEAR: string
  Bonus14?: string
  BonusDecember?: string
  Accreditation1?: string
  Accreditation2?: string
  UserWhoCreates?: string
  deducciones?: Deductions[]
}

export type Deductions = {
  tipo: string
  monto: number
  observaciones?: string
}
