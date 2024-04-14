/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatters'
import { boardeModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { ObjectId } from 'mongodb'


const createNew = async (user, reqBody) => {
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title),
      auth: user.userId.toString(),
      members: [user.userId.toString()]
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

const moveCardToDifferentColumn = async (reqBody) => {
  try {
    /**
   * Khi di chuyển card sang column khác
   * B1: Cập nhật mảng cardOrrderIds của column ban đầu chứa nó (Hiểu bản chất là xoá Card ra khỏi mảng)
   * B2: Cập nhật mảng cardOrrderIds của column tiếp theo ( Hiểu bản chất là thêm id của card vao mảng)
   * B3: Cập nhật lại trường columnId mới của cái card đã kéo
   * ==> làm một API support riêng
    */
    // B1
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updatedAt: Date.now()
    })
    //B2
    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updatedAt: Date.now()
    })
    //B3
    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId
    })

    return { updateResult: 'Successfully' }
  } catch (error) {
    throw error
  }
}

const getAllBoardForUser = async (user) => {
  try {

    const board = await boardeModel.findAllBoardForUser(user.userId)
    return {
      code: StatusCodes.OK,
      metadata: board
    }
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getAllBoardForUser
}