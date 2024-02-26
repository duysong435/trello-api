/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatters'
import { boardeModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'


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

    // Deep clone board ra một cái mới để xử lý, không ảnh hưởng  tới board ban đầu, tuỳ mục đích sử dụng về sau mà cần clone deep hay không

    const resBoard = cloneDeep(board)
    // Đưa card về đúng  column của nó
    resBoard.columns.forEach(column => {
      // Cách dùng .equals này là bưởi vì chúng ta hiểu ObjectId trong mongoDb có support method .equals
      column.cards = resBoard.cards.filter(card => card.columnId.equals(column._id.toString()))

      // Câch khác đơn giản là convert ObejctId về string bằng hàm toString() của Javascript
      // column.cards = resBoard.cards.filter(card => card.columnId.toString() === column._id.toString())
    })

    // Xoá mảng card khôt cái board ban đầu
    delete resBoard.cards
    return resBoard
  } catch (error) {
    throw error
  }
}

const update = async (boardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedBoard = await boardeModel.update(boardId, updateData)

    return updatedBoard
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetails,
  update
}