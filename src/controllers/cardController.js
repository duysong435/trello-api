import { StatusCodes } from 'http-status-codes'
import { cardService } from '~/services/cardService'


const createNew = async (req, res, next) => {
  try {
    const createColumn = await cardService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createColumn)
  } catch (error) { next(error) }
}

const updateCard = async (req, res, next) => {
  try {
    const result = await cardService.updateCard(req.body)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) { next(error) }
}

export const cardController = {
  createNew,
  updateCard
}