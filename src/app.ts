import 'express-async-errors'
import express, { Express, Request, Response } from 'express'
const app: Express = express()

// security packages
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

app.set('trust proxy', 1)
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

// error handlers
import errorHandler from './middlewares/errorHandler'
import notFound from './middlewares/notFound'

// Swagger
import swaggerUI from 'swagger-ui-express'
import YAML from 'yamljs'
const swaggerDocument = YAML.load('./swagger.yaml')

// routes
app.get('/', (req: Request, res: Response) => {
  res.send(
    '<h1>Jobs API</h1> <a href="/api-docs">Visit the API documentation</a>'
  )
})

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))

export const authRoute = '/api/v1/auth'
export const jobRoute = '/api/v1/jobs'

app.use(authRoute, authRouter)
app.use(jobRoute, authenticateUser, jobRouter)

app.use(errorHandler)
app.use(notFound)

export default app
