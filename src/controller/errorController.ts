import { Request, Response, NextFunction } from 'express'
import { AppError } from '~/utils/AppError'

const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  })
}

const sendErrorProd = (err: AppError, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    })
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err)

    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    })
  }
}

const handleCastErrorDB = (err: any) => {
  const message = `Inválido ${err.path}: ${err.value}.`
  return new AppError(message, 400)
}

const handleDuplicateFieldsDB = (err: any) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]
  const message = `Valor duplicado: ${value}. Por favor use otro valor.`
  return new AppError(message, 400)
}

const handleValidationErrorDB = (err: any) => {
  const errors = Object.values(err.errors).map((el: any) => el.message)
  const message = `Datos inválidos: ${errors.join('. ')}`
  return new AppError(message, 400)
}

const handleJWTError = () =>
  new AppError('Token inválido. Por favor inicie sesión de nuevo.', 401)

const handleJWTExpiredError = () =>
  new AppError('Tu token ha expirado. Por favor inicie sesión de nuevo.', 401)

const handleDatabaseError = (err: any) => {
  // Intento de manejo genérico para errores de BD (ajustar según driver)
  if (err.code === 'ECONNREFUSED') {
    return new AppError('Error de conexión a la base de datos', 500)
  }
  if (err.number) {
    // MSSQL error codes
    return new AppError(`Error de base de datos: ${err.message}`, 500)
  }
  return new AppError('Error de base de datos', 500)
}

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  console.log('💥 ERROR IN GLOBAL HANDLER:', {
    message: err.message,
    stack: err.stack,
    code: err.code,
    name: err.name
  })

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res)
  } else {
    let error = { ...err }
    error.message = err.message

    if (error.name === 'CastError') error = handleCastErrorDB(error)
    if (error.code === 11000) error = handleDuplicateFieldsDB(error)
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error)
    if (error.name === 'JsonWebTokenError') error = handleJWTError()
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError()
    // Detectar errores de BD (MSSQL suele tener 'number' o 'code')
    if (error.number || error.sqlState || error.code === 'ECONNREFUSED') {
      error = handleDatabaseError(error)
    }

    sendErrorProd(error, res)
  }
}
