import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { UnauthenticatedError } from '../errors'

interface jwtPayload {
  userId: string
  name: string
}

export interface CustomRequest extends Request {
  user: jwtPayload
}

const authenticateUser = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthenticatedError('No token provided, invalid authentication')
  }

  const bearerToken = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(
      bearerToken,
      process.env.JWT_SECRET
    ) as jwtPayload

    req.user = { userId: decoded.userId, name: decoded.name }
    next()
  } catch (error) {
    throw new UnauthenticatedError('Invalid token')
  }
}

export default authenticateUser
