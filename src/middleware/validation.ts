import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';
import { ApiResponse } from '../types';

export class ValidationMiddleware {
  /**
   * Middleware para manejar errores de validación
   */
  public static handleValidationErrors(req: Request, res: Response, next: NextFunction): void {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error: ValidationError) => {
        if (error.type === 'field') {
          return `${error.path}: ${error.msg}`;
        }
        return error.msg;
      });

      res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errorMessages,
      } as ApiResponse);
      return;
    }

    next();
  }

  /**
   * Middleware para sanitizar entrada de datos
   */
  public static sanitizeInput(req: Request, res: Response, next: NextFunction): void {
    // Sanitizar body
    if (req.body && typeof req.body === 'object') {
      req.body = ValidationMiddleware.deepSanitize(req.body);
    }

    // Sanitizar query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = ValidationMiddleware.deepSanitize(req.query);
    }

    // Sanitizar params
    if (req.params && typeof req.params === 'object') {
      req.params = ValidationMiddleware.deepSanitize(req.params);
    }

    next();
  }

  /**
   * Sanitización profunda de objetos
   */
  private static deepSanitize(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return ValidationMiddleware.sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => ValidationMiddleware.deepSanitize(item));
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const sanitizedKey = ValidationMiddleware.sanitizeString(key);
          sanitized[sanitizedKey] = ValidationMiddleware.deepSanitize(obj[key]);
        }
      }
      return sanitized;
    }

    return obj;
  }

  /**
   * Sanitizar strings
   */
  private static sanitizeString(str: string): string {
    if (typeof str !== 'string') {
      return str;
    }

    return str
      .trim()
      .replace(/[<>]/g, '') // Remover < y >
      .replace(/javascript:/gi, '') // Remover javascript:
      .replace(/on\w+=/gi, '') // Remover event handlers
      .replace(/data:/gi, '') // Remover data URLs
      .substring(0, 1000); // Limitar longitud
  }

  /**
   * Validar estructura de JSON
   */
  public static validateJSONStructure(expectedFields: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.body || typeof req.body !== 'object') {
        res.status(400).json({
          success: false,
          message: 'Body JSON válido requerido',
        } as ApiResponse);
        return;
      }

      const missingFields = expectedFields.filter(field => !(field in req.body));
      
      if (missingFields.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Campos requeridos faltantes',
          errors: missingFields.map(field => `Campo requerido: ${field}`),
        } as ApiResponse);
        return;
      }

      next();
    };
  }

  /**
   * Validar que no haya campos extra no permitidos
   */
  public static validateAllowedFields(allowedFields: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.body || typeof req.body !== 'object') {
        next();
        return;
      }

      const extraFields = Object.keys(req.body).filter(field => !allowedFields.includes(field));
      
      if (extraFields.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Campos no permitidos detectados',
          errors: extraFields.map(field => `Campo no permitido: ${field}`),
        } as ApiResponse);
        return;
      }

      next();
    };
  }

  /**
   * Validar límites de profundidad de objetos anidados
   */
  public static validateObjectDepth(maxDepth: number = 5) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.body) {
        next();
        return;
      }

      const depth = ValidationMiddleware.getObjectDepth(req.body);
      
      if (depth > maxDepth) {
        res.status(400).json({
          success: false,
          message: `Objeto demasiado anidado. Máximo ${maxDepth} niveles permitidos`,
        } as ApiResponse);
        return;
      }

      next();
    };
  }

  /**
   * Calcular profundidad de objeto
   */
  private static getObjectDepth(obj: any, currentDepth: number = 0): number {
    if (obj === null || typeof obj !== 'object') {
      return currentDepth;
    }

    if (currentDepth > 10) { // Prevenir stack overflow
      return currentDepth;
    }

    let maxDepth = currentDepth;
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const depth = ValidationMiddleware.getObjectDepth(obj[key], currentDepth + 1);
        maxDepth = Math.max(maxDepth, depth);
      }
    }

    return maxDepth;
  }

  /**
   * Validar límites de array
   */
  public static validateArrayLimits(maxLength: number = 100) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.body) {
        next();
        return;
      }

      const hasLargeArray = ValidationMiddleware.checkArraySizes(req.body, maxLength);
      
      if (hasLargeArray) {
        res.status(400).json({
          success: false,
          message: `Array demasiado grande. Máximo ${maxLength} elementos permitidos`,
        } as ApiResponse);
        return;
      }

      next();
    };
  }

  /**
   * Verificar tamaños de arrays recursivamente
   */
  private static checkArraySizes(obj: any, maxLength: number): boolean {
    if (Array.isArray(obj)) {
      if (obj.length > maxLength) {
        return true;
      }
      return obj.some(item => ValidationMiddleware.checkArraySizes(item, maxLength));
    }

    if (obj && typeof obj === 'object') {
      return Object.values(obj).some(value => ValidationMiddleware.checkArraySizes(value, maxLength));
    }

    return false;
  }

  /**
   * Middleware para validar encoding de caracteres
   */
  public static validateEncoding(req: Request, res: Response, next: NextFunction): void {
    try {
      // Verificar que el body se pueda serializar correctamente
      if (req.body) {
        JSON.stringify(req.body);
      }
      
      // Verificar query parameters
      if (req.query) {
        JSON.stringify(req.query);
      }
      
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Encoding de caracteres inválido',
      } as ApiResponse);
    }
  }
}