import { Response } from 'express'
import { body, validationResult, ValidationChain } from 'express-validator'
import { StatusCodes } from 'http-status-codes'
import Job from '../models/Job'
import { CustomRequest } from '../middlewares/authentication'
import { NotFoundError } from '../errors'

const getJobs = async (req: CustomRequest, res: Response) => {
  const jobs = await Job.find({ createdBy: req.user.userId })
  res.status(StatusCodes.OK).json({ jobs })
}

const getJob = async (req: CustomRequest, res: Response) => {
  const job = await Job.findOne({
    _id: req.params.id,
    createdBy: req.user.userId,
  })

  if (!job) {
    throw new NotFoundError(`No job found with id ${req.params.id}`)
  }

  res.status(StatusCodes.OK).json({ job })
}

const createJob: Array<
  ValidationChain | ((req: CustomRequest, res: Response) => void)
> = [
  body('company', 'Please provide company name').trim().notEmpty().escape(),
  body('position', 'Please provide job position').trim().notEmpty().escape(),
  body('status').optional().trim().notEmpty().escape(),

  async function (req: CustomRequest, res: Response) {
    validationResult(req).throw()

    req.body.createdBy = req.user.userId
    const { company, position, status, createdBy } = req.body

    const job = await Job.create({ company, position, status, createdBy })

    res
      .status(StatusCodes.CREATED)
      .json({ job, message: 'Successfully created job' })
  },
]

const updateJob: Array<
  ValidationChain | ((req: CustomRequest, res: Response) => void)
> = [
  body('company', 'Please provide company name').trim().notEmpty().escape(),
  body('position', 'Please provide job position').trim().notEmpty().escape(),
  body('status', 'Please provide job status')
    .optional()
    .trim()
    .notEmpty()
    .escape(),

  async function (req: CustomRequest, res: Response) {
    validationResult(req).throw()

    const { company, position, status } = req.body
    const { userId: createdBy } = req.user
    const { id: _id } = req.params

    const job = await Job.findOneAndUpdate(
      { _id, createdBy },
      { company, position, status },
      { new: true, runValidators: true }
    )

    if (!job) {
      throw new NotFoundError(`No job found with id ${_id}`)
    }

    res
      .status(StatusCodes.OK)
      .json({ job, message: 'Successfully updated job' })
  },
]

const deleteJob = async (req: CustomRequest, res: Response) => {
  const job = await Job.findOneAndDelete({
    _id: req.params.id,
    createdBy: req.user.userId,
  })

  if (!job) {
    throw new NotFoundError(`No job found with id ${req.params.id}`)
  }

  res.status(StatusCodes.OK).json({ message: 'Successfully deleted job' })
}

export { getJobs, getJob, createJob, updateJob, deleteJob }
