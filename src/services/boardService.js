/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatters'
import { boardeModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'


const createNew = async (reqBody) => {
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    const createBoard = await boardeModel.createNew(newBoard)
    // console.log('createBoardm', createBoard)

    const getNewBoard = await boardeModel.findOneById(createBoard.insertedId)
    // console.log('getNewBoard', getNewBoard)
    return getNewBoard
  } catch (error) {
    throw error
  }
}

const getDetails = async (boardId) => {
  try {

    const board = await boardeModel.getDetails(boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }
    return board
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetails
}