import mongoose from 'mongoose'
import 'dotenv/config'

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGO_URI)
  await mongoose.connection.db.dropDatabase()
})

afterAll(async () => {
  await mongoose.disconnect()
})
