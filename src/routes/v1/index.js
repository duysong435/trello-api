import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoute } from './boardRoute'
import { columnRoute } from './columnRoute'
import { cardRoute } from './cardRoute'
import { userRouter } from './userRouter'
import { passportGGAuth } from './passportGGAuthRouter'
import { uploadImage } from './upload'
import { workspaceRoute } from './workspaceRoute'
const Router = express.Router()

Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'API v1' })
})

Router.use('/boards', boardRoute)
Router.use('/columns', columnRoute)
Router.use('/cards', cardRoute)
Router.use('/user', userRouter)
Router.use('/auth', passportGGAuth)
Router.use('/upload', uploadImage)
Router.use('/workspace', workspaceRoute)
export const APIs_V1 = Router
