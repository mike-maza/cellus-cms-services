import { User } from '../entities/User';

export interface IAuthService {
  generateToken(user: User): string;
  verifyToken(token: string): any;
  generateRefreshToken(user: User): string;
  verifyRefreshToken(token: string): any;
  verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
  hashPassword(plainPassword: string): Promise<string>;
  getTokenExpiration(): number;
}