import 'dotenv/config'
import app from './app'
import connectDB from './db'

async function main() {
  try {
    await connectDB()
    console.log('Connected to MongoDB')
    app.listen(process.env.PORT, () => {
      console.log(`Server is listening at ${process.env.PORT}`)
    })
  } catch (error) {
    console.log(error)
  }
}

main()
