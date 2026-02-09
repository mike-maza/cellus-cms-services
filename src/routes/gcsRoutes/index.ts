import { Router } from 'express'
import gcsController from '~/controller/gcsController'
import { authMiddleware } from '~/middleware/authMiddleware'

class GcsRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    /**
     * RUTA: /gcs/images/:cod
     * DESCRIPCIÓN: Obtiene las imágenes de un empleado
     */
    this.router.get(
      '/images/:cod',
      authMiddleware,
      gcsController.getEmployeeImages
    )
    /**
     * RUTA: /gcs/images/delete
     * DESCRIPCIÓN: Elimina una imagen específica
     */
    this.router.delete(
      '/delete-image',
      authMiddleware,
      gcsController.deleteImage
    )
  }
}

const gcsRoutes = new GcsRoutes()
export default gcsRoutes.router
