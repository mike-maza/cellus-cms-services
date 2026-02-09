import { Router } from 'express';
import { AuthController } from '../../../controllers/AuthController';
import { authMiddleware } from '../../../middleware/auth/jwt-middleware';
import { validateRequest } from '../../../middleware/validation/request-validator';

export function createAuthRoutes(authController: AuthController): Router {
  const router = Router();

  // Public routes
  router.post('/login', 
    validateRequest('login'),
    (req, res) => authController.login(req, res)
  );

  router.post('/register', 
    validateRequest('register'),
    (req, res) => authController.register(req, res)
  );

  // Protected routes
  router.post('/refresh', 
    authMiddleware,
    (req, res) => authController.refreshToken(req, res)
  );

  router.post('/logout', 
    authMiddleware,
    (req, res) => authController.logout(req, res)
  );

  return router;
}