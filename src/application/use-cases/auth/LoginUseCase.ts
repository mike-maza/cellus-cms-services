import { User } from '../../../core/domain/entities/User';
import { Email } from '../../../core/domain/value-objects/Email';
import { DomainError } from '../../../core/shared/errors/DomainError';
import { IUserRepository } from '../../../core/domain/contracts/IUserRepository';
import { IAuthService } from '../../../core/domain/contracts/IAuthService';
import { LoginRequest } from '../../dto/requests/LoginRequest';
import { AuthResponse } from '../../dto/responses/AuthResponse';

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authService: IAuthService
  ) {}

  async execute(request: LoginRequest): Promise<AuthResponse> {
    try {
      // Validar email
      const email = Email.create(request.email);

      // Buscar usuario
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new DomainError('Invalid credentials', 'INVALID_CREDENTIALS');
      }

      // Verificar contraseña
      const isValidPassword = await this.authService.verifyPassword(
        request.password,
        user.password
      );

      if (!isValidPassword) {
        throw new DomainError('Invalid credentials', 'INVALID_CREDENTIALS');
      }

      // Verificar si usuario está activo
      if (!user.isActive()) {
        throw new DomainError('User account is not active', 'ACCOUNT_INACTIVE');
      }

      // Generar token
      const token = this.authService.generateToken(user);

      return {
        user: user.toJSON(),
        token,
        expiresIn: this.authService.getTokenExpiration()
      };

    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new DomainError('Login failed', 'LOGIN_ERROR');
    }
  }
}