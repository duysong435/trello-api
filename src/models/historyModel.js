import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { BOARD_TYPES, HISTORY_TYPE } from '~/utils/constants'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { columnModel } from './columnModel'
import { cardModel } from './cardModel'

// Define collection (Name & Schema)

const HISTORY_COLLECTION_NAME = 'history'
const HISTORY_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().min(3).max(50).trim().strict(),
  type: Joi.string().valid(HISTORY_TYPE.CREATE, HISTORY_TYPE.DELETE, HISTORY_TYPE.UPDATE),
  content: Joi.string().trim().strict(),
  auth: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

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
  return await HISTORY_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validata = await validateBeforeCreate(data)
    validata.auth = new ObjectId(validata.auth)
    validata.members[0] = new ObjectId(validata.members[0])

    const createBoard = await GET_DB().collection(HISTORY_COLLECTION_NAME).insertOne(validata)
    return createBoard
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {

    const result = await GET_DB().collection(HISTORY_COLLECTION_NAME).findOne({
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

    // const result = await GET_DB().collection(HISTORY_COLLECTION_NAME).findOne({
    //   _id: new ObjectId(id)
    // })
    const result = await GET_DB().collection(HISTORY_COLLECTION_NAME).aggregate([
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
    const result = await GET_DB().collection(HISTORY_COLLECTION_NAME).findOneAndUpdate(
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
    const result = await GET_DB().collection(HISTORY_COLLECTION_NAME).findOneAndUpdate(
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

// Lấy một phần tử columnId ra khỏi mảng columnIds
// Dùng $pull trong mongodb ở trường hợp này để lấy một phần tử ra  khỏi mảng rồi xoá nó đi
const pullColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB().collection(HISTORY_COLLECTION_NAME).findOneAndUpdate(
      {
        _id: new ObjectId(column.boardId)

      },
      {
        $pull: {
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

const findAllBoardForUser = async (userId) => {
  try {
    const result = await GET_DB().collection(HISTORY_COLLECTION_NAME).find(
      {
        auth: new ObjectId(userId),
        members: { $in: [new ObjectId(userId)] }
      }
    ).toArray()
    // console.log(result)
    return result || null
  } catch (error) {
    throw new Error(error)
  }
}


export const boardeModel = {
  HISTORY_COLLECTION_NAME,
  HISTORY_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnOrderIds,
  update,
  pullColumnOrderIds,
  findAllBoardForUser
}