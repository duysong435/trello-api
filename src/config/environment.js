import 'dotenv/config'

export const env = {
  MONGODB_URI: process.env.MONGODB_URI,
  DATABASE_NAME: process.env.DATABASE_NAME,
  APP_HOST: process.env.APP_HOST,
  APP_PORT: process.env.APP_PORT,
  GOOGLE_AUTH_ID: process.env.GOOGLE_AUTH_ID,
  GOOGLE_AUTH_SECRET: process.env.GOOGLE_AUTH_SECRET,
  BUILD_MODE: process.env.BUILD_MODE
}
