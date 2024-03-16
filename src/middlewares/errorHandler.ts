import { StatusCodes } from 'http-status-codes'
import { Request, Response, NextFunction } from 'express'
import { MongooseError } from 'mongoose'
import {
  Result,
  ValidationError,
  FieldValidationError,
} from 'express-validator'

interface CustomError extends Error, MongooseError {
  statusCode?: StatusCodes
  code?: number
  errors: FieldValidationError[] | MongooseError[]
  value: string
  keyValue: string
}

export default function errorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let customError = {
    message: err.message ?? 'Something went wrong, try again later',
    statusCode: err.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR,
  }

  if (err.hasOwnProperty('throw')) {
    let errorMessage = ''
    err.errors.forEach(
      (errObj) => (errorMessage += `${(errObj as ValidationError).msg}, `)
    )
    errorMessage = errorMessage.slice(0, -2)

    customError.message = errorMessage
    customError.statusCode = 400
  }

  if (err.name === 'ValidationError') {
    let errorMessage = ''
    Object.values(err.errors).forEach(
      (errObj) => (errorMessage += `${errObj.message}, `)
    )
    errorMessage = errorMessage.slice(0, -2)

    customError.message = errorMessage
    customError.statusCode = 400
  }

  if (err.name === 'CastError') {
    customError.message = `No item found with id ${err.value}`
    customError.statusCode = 404
  }

  if (err.code && err.code === 11000) {
    customError.message = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )} field, please choose another value`
    customError.statusCode = 400
  }

  res.status(customError.statusCode).json({ message: customError.message })
}
