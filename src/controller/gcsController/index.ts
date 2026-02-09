import type { Request, Response } from 'express'
import {
  RESPONSE_CODE_SUCCESS,
  RESPONSE_MESSAGE_SUCCESS,
  RESPONSE_STATUS_SUCCESS
} from '~/constants/RESPONSE_MESSAGE'
import { gcsService } from '~/utils/googleStorage'
import { catchAsync } from '~/utils/catchAsync'

class GCSController {
  /**
   * Obtiene las imágenes de un empleado (DPI_FRONT y DPI_BACK)
   */
  public getEmployeeImages = catchAsync(async (req: Request, res: Response) => {
    const { cod } = req.params
    const response = {
      responseCode: RESPONSE_CODE_SUCCESS,
      message: RESPONSE_MESSAGE_SUCCESS,
      status: RESPONSE_STATUS_SUCCESS,
      data: [] as any[]
    }

    // Buscamos archivos en el bucket que empiecen con el código del empleado
    // Para eficiencia, lo buscamos como prefijo (dentro del service ya se agrega DPIS/)
    const files = await gcsService.listFiles(cod as string)

    // Tomamos las primeras 2 imágenes que coincidan
    const employeeFiles = files.slice(0, 2)

    response.data = employeeFiles
    res.send({ getImagesResponse: response })
  })

  /**
   * Elimina una imagen específica
   */
  public deleteImage = catchAsync(async (req: Request, res: Response) => {
    const { fileName } = req.body
    const response = {
      responseCode: RESPONSE_CODE_SUCCESS,
      message: RESPONSE_MESSAGE_SUCCESS,
      status: RESPONSE_STATUS_SUCCESS,
      data: null
    }

    await gcsService.deleteFile(fileName)

    res.send({ deleteImageResponse: response })
  })
}

const gcsController = new GCSController()
export default gcsController
