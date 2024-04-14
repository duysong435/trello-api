/* eslint-disable no-console */

import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { corsOptions } from './config/cors'
import exitHook from 'async-exit-hook'
import { CLOSE_DB, CONECT_DB } from './config/mongodb'
import { env } from './config/environment'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware'
const START_SERVER = () => {

  const app = express()
  app.use(cors(corsOptions))
  app.use(morgan('dev'))

  app.use(express.json())
  app.use('/v1', APIs_V1)

  // Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  if (env.BUILD_MODE === 'production') {
    app.listen(process.env.PORT, () => {
      console.log(`App running at production ${process.env.PORT}`)
    })
  } else {
    app.listen(env.APP_PORT, env.APP_HOST, () => {
      console.log(`App running at ${env.APP_HOST}:${env.APP_PORT}`)
    })

  }

  // Thực hiên cleanUp server trước khi dừng lại
  exitHook((signal) => {
    console.log(`Exiting with signal: ${signal}`)
    CLOSE_DB()
  })
}

// Chỉ khi kết nối tới Database thành công thì mới Start back-end lên
(async () => {
  try {
    CONECT_DB()
    console.log('Connected to MongoDB Cloud Atlas!')
    START_SERVER()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()

// Chỉ khi kết nối tới Database thành công thì mới Start back-end lên
// CONECT_DB()
//   .then(() => console.log('Connected to MongoDB Cloud Atlas!'))
//   .then(() => START_SERVER())
//   .catch(error => {
//     console.error(error)
//     process.exit(0)
//   })