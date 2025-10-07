import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export class ErrorHandler {
  /**
   * Middleware global para manejo de errores
   */
  public static handle(error: CustomError, req: Request, res: Response, next: NextFunction): void {
    console.error('Error occurred:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString(),
    });

    // Error de validación de Joi o express-validator
    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: [error.message],
      } as ApiResponse);
      return;
    }

    // Error de JWT
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        message: 'Token inválido',
      } as ApiResponse);
      return;
    }

    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Token expirado',
      } as ApiResponse);
      return;
    }

    // Error de base de datos
    if (error.code === 'EREQUEST' || error.name === 'RequestError') {
      res.status(500).json({
        success: false,
        message: 'Error de base de datos',
      } as ApiResponse);
      return;
    }

    // Error de conexión de base de datos
    if (error.code === 'ELOGIN' || error.code === 'ECONNRESET') {
      res.status(503).json({
        success: false,
        message: 'Servicio temporalmente no disponible',
      } as ApiResponse);
      return;
    }

    // Error de Multer (subida de archivos)
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({
        success: false,
        message: 'Archivo demasiado grande',
      } as ApiResponse);
      return;
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        success: false,
        message: 'Demasiados archivos',
      } as ApiResponse);
      return;
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({
        success: false,
        message: 'Campo de archivo inesperado',
      } as ApiResponse);
      return;
    }

    // Error de sintaxis JSON
    if (error instanceof SyntaxError && 'body' in error) {
      res.status(400).json({
        success: false,
        message: 'JSON malformado',
      } as ApiResponse);
      return;
    }

    // Errores personalizados con statusCode
    if (error.statusCode) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message || 'Error del servidor',
        ...(process.env.NODE_ENV === 'development' && { details: error.details }),
      } as ApiResponse);
      return;
    }

    // Error genérico del servidor
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' 
        ? 'Error interno del servidor' 
        : error.message,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: error.stack,
        details: error.details 
      }),
    } as ApiResponse);
  }

  /**
   * Middleware para manejar rutas no encontradas
   */
  public static notFound(req: Request, res: Response): void {
    res.status(404).json({
      success: false,
      message: `Ruta ${req.method} ${req.url} no encontrada`,
    } as ApiResponse);
  }

  /**
   * Crear error personalizado
   */
  public static createError(message: string, statusCode: number = 500, details?: any): CustomError {
    const error = new Error(message) as CustomError;
    error.statusCode = statusCode;
    error.details = details;
    return error;
  }

  /**
   * Wrapper para funciones async
   */
  public static asyncWrapper(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Validar errores críticos del sistema
   */
  public static handleCriticalError(error: Error): void {
    console.error('CRITICAL ERROR:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    // En producción, podrías enviar alertas por email o a un servicio de monitoreo
    if (process.env.NODE_ENV === 'production') {
      // Implementar notificación de errores críticos
      // EmailService.sendCriticalErrorAlert(error);
    }
  }

  /**
   * Manejar errores no capturados
   */
  public static setupGlobalErrorHandlers(): void {
    process.on('uncaughtException', (error: Error) => {
      console.error('Uncaught Exception:', error);
      ErrorHandler.handleCriticalError(error);
      
      // Graceful shutdown
      process.exit(1);
    });

    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      ErrorHandler.handleCriticalError(new Error(`Unhandled Rejection: ${reason}`));
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      process.exit(0);
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      process.exit(0);
    });
  }
}