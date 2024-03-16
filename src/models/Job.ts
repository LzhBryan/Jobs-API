import { Schema, model, Types } from 'mongoose'

interface IJob {
  company: string
  position: string
  status?: 'pending' | 'declined' | 'interview'
  createdBy: Types.ObjectId
}

const jobSchema = new Schema<IJob>(
  {
    company: { type: String, required: [true, 'Please provide company name'] },
    position: {
      type: String,
      required: [true, 'Please provide job position'],
      default: 'pending',
    },
    status: { type: String, enum: ['pending', 'declined', 'interview'] },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide user'],
    },
  },
  { timestamps: true }
)

const Job = model<IJob>('Job', jobSchema)

export default Job
