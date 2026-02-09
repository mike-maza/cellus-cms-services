import { Request, Response } from 'express';
import { LoginUseCase } from '../../../application/use-cases/auth/LoginUseCase';
import { RegisterUseCase } from '../../../application/use-cases/auth/RegisterUseCase';
import { LoginRequest } from '../../../application/dto/requests/LoginRequest';
import { ApiSuccessResponse, ApiErrorResponse } from '../../../application/dto/responses/AuthResponse';

export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase
  ) {}

  async login(req: Request, res: Response): Promise<void> {
    try {
      const loginRequest: LoginRequest = req.body;
      
      // Validar request
      this.validateLoginRequest(loginRequest);

      const result = await this.loginUseCase.execute(loginRequest);

      const response: ApiSuccessResponse = {
        success: true,
        data: result,
        message: 'Login successful'
      };

      res.status(200).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const registerRequest = req.body;
      
      // Validar request
      this.validateRegisterRequest(registerRequest);

      const result = await this.registerUseCase.execute(registerRequest);

      const response: ApiSuccessResponse = {
        success: true,
        data: result,
        message: 'User registered successfully'
      };

      res.status(201).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private validateLoginRequest(request: LoginRequest): void {
    if (!request.email || !request.password) {
      throw new Error('Email and password are required');
    }

    if (typeof request.email !== 'string' || typeof request.password !== 'string') {
      throw new Error('Invalid request format');
    }
  }

  private validateRegisterRequest(request: any): void {
    if (!request.email || !request.password || !request.confirmPassword) {
      throw new Error('Email, password, and confirm password are required');
    }

    if (request.password !== request.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    if (request.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
  }

  private handleError(error: any, res: Response): void {
    console.error('AuthController error:', error);

    if (error.name === 'DomainError' || error.name === 'ValidationError') {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: error.code || 'VALIDATION_ERROR',
          message: error.message
        }
      };
      return res.status(400).json(errorResponse);
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    };

    res.status(500).json(errorResponse);
  }
}