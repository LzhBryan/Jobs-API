import 'express-async-errors'

// security packages
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

import express, { Express, Request, Response } from 'express'

const app: Express = express()

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  })
)
app.use(express.json())
app.use(helmet())
app.use(cors())

// routers
import authRouter from './routes/auth'
import jobRouter from './routes/jobs'

import authenticateUser from './middlewares/authentication'

// routes
app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server')
})

export const authRoute = '/api/v1/auth'
export const jobRoute = '/api/v1/jobs'

app.use(authRoute, authRouter)
app.use(jobRoute, authenticateUser, jobRouter)

// middlewares
import errorHandler from './middlewares/errorHandler'
import notFound from './middlewares/notFound'

app.use(errorHandler)
app.use(notFound)

export default app
