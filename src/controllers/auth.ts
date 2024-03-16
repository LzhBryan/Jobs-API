import { Request, Response } from 'express'
import { ValidationChain, body, validationResult } from 'express-validator'
import { StatusCodes } from 'http-status-codes'
import User from '../models/User'
import { BadRequestError, UnauthenticatedError } from '../errors/index'

const registerUser: Array<
  ValidationChain | ((req: Request, res: Response) => void)
> = [
  body('name', 'Please enter name').trim().notEmpty().escape(),
  body('username', 'Please enter username')
    .trim()
    .notEmpty()
    .isEmail()
    .withMessage('Please provide a valid email')
    .escape()
    .custom(async (inputUsername) => {
      const usernameExists = await User.findOne({ username: inputUsername })

      if (usernameExists) {
        throw new BadRequestError('Username already exists')
      }
    }),
  body('password', 'Please enter password')
    .trim()
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .escape(),

  async function (req: Request, res: Response) {
    validationResult(req).throw()

    const { name, username, password } = req.body
    const user = await User.create({ name, username, password })
    const token = user.createJwtToken()

    res
      .status(StatusCodes.CREATED)
      .json({ token, message: 'Successfully registered user' })
  },
]

const loginUser: Array<
  ValidationChain | ((req: Request, res: Response) => void)
> = [
  body('username', 'Please enter username')
    .trim()
    .notEmpty()
    .isEmail()
    .withMessage('Please provide a valid email')
    .escape(),
  body('password', 'Please enter password').trim().notEmpty().escape(),

  async function (req: Request, res: Response) {
    validationResult(req).throw()

    const { username, password } = req.body
    const user = await User.findOne({ username })

    if (!user) {
      throw new UnauthenticatedError('Invalid credentials')
    }

    const isPasswordMatch = await user.comparePassword(password)

    if (!isPasswordMatch) {
      throw new UnauthenticatedError('Invalid credentials')
    }

    const token = user.createJwtToken()

    res.status(StatusCodes.OK).json({ token })
  },
]

export { registerUser, loginUser }
