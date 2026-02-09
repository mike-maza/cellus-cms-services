// Solución temporal para problemas de CDN con Swagger UI
// Este archivo sirve los assets de Swagger localmente

import express, { Router } from 'express'
import path from 'path'

const router: Router = Router()

// Servir archivos estáticos de swagger-ui-dist
const swaggerUiPath = path.dirname(
  require.resolve('swagger-ui-dist/package.json')
)

router.use('/swagger-ui', express.static(swaggerUiPath))

export default router
