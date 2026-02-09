export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification'
}

export const UserStatusLabels = {
  [UserStatus.ACTIVE]: 'Activo',
  [UserStatus.INACTIVE]: 'Inactivo', 
  [UserStatus.SUSPENDED]: 'Suspendido',
  [UserStatus.PENDING_VERIFICATION]: 'Pendiente de Verificación'
} as const;