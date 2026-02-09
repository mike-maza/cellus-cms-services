export interface LoginRequest {
  email: string;
  password: string;
  twoFactorToken?: string; // Opcional para 2FA
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
}

export interface Enable2FARequest {
  token: string; // Token de 6 dígitos
}

export interface Verify2FARequest {
  userId: string;
  token: string;
}