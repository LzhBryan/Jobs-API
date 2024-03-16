import express from 'express'
import {
  getJob,
  getJobs,
  createJob,
  updateJob,
  deleteJob,
} from '../controllers/job'

const router = express.Router()

router.route('/').get(getJobs).post(createJob)
router.route('/:id').get(getJob).patch(updateJob).delete(deleteJob)

export default router
