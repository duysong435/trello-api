
import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoutes } from './boardRoutes'
const router = express.Router()

router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'API v1' })
})

router.use('/boards', boardRoutes)
export const APIs_V1 = router