import { StatusCodes } from 'http-status-codes'

export default class NotFoundError extends Error {
  constructor(
    public message: string,
    public statusCode: StatusCodes = StatusCodes.NOT_FOUND
  ) {
    super(message)
  }
}
