import { boardeModel } from '~/models/boardModel'
import { columnModel } from '~/models/columnModel'


const createNew = async (reqBody) => {
  try {
    const newColumn = {
      ...reqBody
    }
    const createColumn = await columnModel.createNew(newColumn)
    const getNewColumn = await columnModel.findOneById(createColumn.insertedId)
    if (getNewColumn) {
      // Xử cấu trúc data ở đây trước khi trả dữ liệu về
      getNewColumn.cards = []

      // Cập nhật lại mảng ColumnOrderIds trong colection boards
      await boardeModel.pushColumnOrderIds(getNewColumn)
    }

    return getNewColumn
  } catch (error) {
    throw error
  }
}


export const columnService = {
  createNew
}