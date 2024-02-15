
import express from 'express'
import { StatusCodes } from 'http-status-codes'

const router = express.Router()

router.route('/')
  .get((req, res) => {
    res.status(StatusCodes.OK).json({ message: 'API v1 get board' })
  })
  .post((req, res) => {
    res.status(StatusCodes.CREATED).json({ message: 'API v1 post board' })

  })

export const boardRoutes = router