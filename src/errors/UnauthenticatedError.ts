import { StatusCodes } from 'http-status-codes'

export default class UnauthenticatedError extends Error {
  constructor(
    public message: string,
    public statusCode: StatusCodes = StatusCodes.UNAUTHORIZED
  ) {
    super(message)
  }
}
