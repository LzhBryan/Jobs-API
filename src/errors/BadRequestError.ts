import { StatusCodes } from 'http-status-codes'

export default class BadRequestError extends Error {
  constructor(
    public message: string,
    public statusCode: StatusCodes = StatusCodes.BAD_REQUEST
  ) {
    super(message)
  }
}
