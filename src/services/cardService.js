import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'


const createNew = async (reqBody) => {
  try {
    const newCard = {
      ...reqBody
    }
    const createCard = await cardModel.createNew(newCard)
    const getNewCard = await cardModel.findOneById(createCard.insertedId)
    if (getNewCard) {
      // Xử cấu trúc data ở đây trước khi trả dữ liệu về
      getNewCard.cards = []

      // Cập nhật lại mảng ColumnOrderIds trong colection Cards
      await columnModel.pushCardOrderIds(getNewCard)
    }
    return getNewCard
  } catch (error) {
    throw error
  }
}


export const cardService = {
  createNew
}