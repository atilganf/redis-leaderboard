const mongoose = require("mongoose")

const config = {
  host: process.env.MONGO_HOST,
  port: process.env.MONGO_PORT,
  database: process.env.MONGO_DATABASE
}

const MONGO_URI = `mongodb://${config.host}:${config.port}/${config.database}`

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI)

    console.log(`MongoDB connected: ${conn.connection.host}`.cyan.underline)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

module.exports = connectDB