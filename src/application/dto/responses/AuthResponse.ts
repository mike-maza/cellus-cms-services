import { User } from '../../../core/domain/entities/User';

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
  expiresIn: number;
  requires2FA?: boolean;
}

export interface UserResponse {
  id: bigint;
  email: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TwoFactorResponse {
  secret: string;
  qrCode: string;
  backupCodes?: string[];
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}