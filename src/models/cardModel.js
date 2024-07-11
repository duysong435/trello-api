

import Joi from 'joi'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { ObjectId } from 'mongodb'

// Define Collection (name & schema)
const CARD_COLLECTION_NAME = 'cards'
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().default(''),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'boardId', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await CARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validata = await validateBeforeCreate(data)
    // Biến đổi một số dữ liệu liên quan tới ObjectId chuẩn chỉnh
    const newCardToAdd = {
      ...validata,
      boardId: new ObjectId(validata.boardId),
      columnId: new ObjectId(validata.columnId)
    }
    const createCard = await GET_DB().collection(CARD_COLLECTION_NAME).insertOne(newCardToAdd)
    return createCard
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {

    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOne({
      _id: new ObjectId(id)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}
const deleteManyByColumnId = async (columnId) => {
  try {

    const result = await GET_DB().collection(CARD_COLLECTION_NAME).deleteMany({
      columnId: new ObjectId(columnId)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}
const update = async (cardId, updateData) => {
  try {
    // Lọc những field mà chúng ta không cho phép cập nhật linh tinh
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })
    // Đối với những dữ liệu liên quan objectId, biển đổi ở đây ( tuỳ sau này nếu cần thì tách function riềng) 
    if (updateData.columnId) {
      updateData.columnId = new ObjectId(updateData.columnId)
    }
    updateData.updatedAt = new Date()
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      {
        _id: new ObjectId(cardId)

      },
      {
        $set: updateData
      },
      {
        returnDocument: 'after'
      }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}
const updateCard = async (cardId, updateData) => {
  try {
    // Lọc những field mà chúng ta không cho phép cập nhật linh tinh
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })
    // Đối với những dữ liệu liên quan objectId, biển đổi ở đây ( tuỳ sau này nếu cần thì tách function riềng)
    if (updateData.columnId) {
      updateData.columnId = new ObjectId(updateData.columnId)
    }
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).updateOne(
      {
        _id: new ObjectId(cardId)

      },
      {
        $set: updateData
      }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}
export const cardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  update,
  deleteManyByColumnId,
  updateCard
}