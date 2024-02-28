import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { BOARD_TYPES } from '~/utils/constants'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { columnModel } from './columnModel'
import { cardModel } from './cardModel'

// Define collection (Name & Schema)

const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),
  type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),

  columnOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updateAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// Chỉ định ra những fields mà chúng ta không muốn cho phép cập nhật trong hàm update()
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validata = await validateBeforeCreate(data)

    const createBoard = await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(validata)
    return createBoard
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {

    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({
      _id: new ObjectId(id)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Query tổng hợp (aggregate) để lấy toàn bộ Columns và Cards thuộc về Board
const getDetails = async (id) => {
  try {

    // const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({
    //   _id: new ObjectId(id)
    // })
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
      {
        $match: {
          _id: new ObjectId(id),
          _destroy: false
        }
      },
      {
        $lookup: {
          from: columnModel.COLUMN_COLLECTION_NAME,
          localField: '_id',
          foreignField: 'boardId',
          as: 'columns'
        }
      },
      {
        $lookup: {
          from: cardModel.CARD_COLLECTION_NAME,
          localField: '_id',
          foreignField: 'boardId',
          as: 'cards'
        }
      }
    ]).toArray()
    // console.log(result)
    return result[0] || null
  } catch (error) {
    throw new Error(error)
  }
}

// Nhiệm vụ của function này là cập nhật push 1 giá trị voà cuối mảng columnOrderIds
const pushColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      {
        _id: new ObjectId(column.boardId)

      },
      {
        $push: {
          columnOrderIds: new ObjectId(column._id)
        }
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

const update = async (boardId, updateData) => {
  try {
    // Lọc những field mà chúng ta không cho phép cập nhật linh tinh
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })
    // Đối với những dữ liệu liên quan ObjectId, biến đổi ở đây
    if (updateData.columnOrderIds) {
      updateData.columnOrderIds = updateData.columnOrderIds.map(_id => (new ObjectId(_id)))
    }
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      {
        _id: new ObjectId(boardId)

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

export const boardeModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnOrderIds,
  update
}