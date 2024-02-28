import { StatusCodes } from 'http-status-codes'
// import ApiError from '~/utils/ApiError'
import { boardService } from '~/services/boardService'
const createNew = async (req, res, next) => {
  try {

    // console.log(req.body)
    // console.log(req.query)
    // console.log(req.params)
    // console.log(req.files)
    // console.log(req.cookies)
    // console.log(req.jwtDecoded)
    //Điều hướng sang tầng service
    const createBoard = await boardService.createNew(req.body)
    // Có kết quả thì trả về phía client

    res.status(StatusCodes.CREATED).json(createBoard)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    // console.log(req.params)
    const boardId = req.params.id
    const board = await boardService.getDetails(boardId)
    // Có kết quả thì trả về phía client

    res.status(StatusCodes.OK).json(board)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    // console.log(req.params)
    const boardId = req.params.id
    const updateBoard = await boardService.update(boardId, req.body)
    // Có kết quả thì trả về phía client

    res.status(StatusCodes.OK).json(updateBoard)
  } catch (error) { next(error) }
}

const moveCardToDifferentColumn = async (req, res, next) => {
  try {
    const result = await boardService.moveCardToDifferentColumn(req.body)
    // Có kết quả thì trả về phía client

    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const boardController = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn
}