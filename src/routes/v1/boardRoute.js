import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardValidation } from '~/validations/boardValidation'
import { boardController } from '~/controllers/boardController'
import { authentication } from '~/utils/authUtils'
import { boardeModel } from '~/models/boardModel'
const Router = express.Router()

Router.use(authentication)

Router.route('/get-all-board').get(boardController.getAllBoardForUser)

Router.route('/')
  .get((req, res) => {
    res.status(StatusCodes.OK).json({ message: 'API v1 get board' })
  })
  .post(boardValidation.createNew, boardController.createNew)

Router.route('/:id').get(boardController.getDetails).put(boardValidation.update, boardController.update)
Router.route('/supports/moving_card').put(boardValidation.moveCardToDifferentColumn, boardController.moveCardToDifferentColumn)
Router.route('/getforworkspace/:id').get(boardController.getAllBoardForWorkspace)
export const boardRoute = Router
