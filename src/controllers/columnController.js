import { StatusCodes } from 'http-status-codes'
import { columnService } from '~/services/columnService'


const createNew = async (req, res, next) => {
  try {
    const createColumn = await columnService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createColumn)
  } catch (error) { next(error) }
}
const update = async (req, res, next) => {
  try {
    // console.log(req.params)
    const columnId = req.params.id
    const updateColumn = await columnService.update(columnId, req.body)
    // Có kết quả thì trả về phía client

    res.status(StatusCodes.OK).json(updateColumn)
  } catch (error) { next(error) }
}
const deleteItem = async (req, res, next) => {
  try {
    const columnId = req.params.id
    const result = await columnService.deleteItem(columnId)
    // Có kết quả thì trả về phía client

    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}
export const columnController = {
  createNew,
  update,
  deleteItem
}