import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { BOARD_TYPES } from '~/utils/constants'
import { REGULAR_EMAIL, REGULAR_EMAIL_MESSAGE } from '~/utils/validators'
import { columnModel } from './columnModel'
import { cardModel } from './cardModel'
import { deleteFiled } from '~/utils'
// import { result } from "lodash";

// Define collection (Name & Schema)

const USER_COLLECTION_NAME = 'users'
const USER_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required().min(3).max(100).trim().strict(),
  password: Joi.string().min(6).max(250).trim().strict(),
  email: Joi.string().required().pattern(REGULAR_EMAIL).message(REGULAR_EMAIL_MESSAGE).trim().strict(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// Chỉ định ra những fields mà chúng ta không muốn cho phép cập nhật trong hàm update()
const INVALID_UPDATE_FIELDS = ['_id', 'password', 'createdAt', 'updatedAt', '_destroy', 'googleId']

const validateBeforeCreate = async (data) => {
  return await USER_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

const createNew = async (data) => {
  try {
    const validata = await validateBeforeCreate(data)

    const createUser = await GET_DB().collection(USER_COLLECTION_NAME).insertOne(validata)

    return createUser
  } catch (error) {
    throw new Error(error)
  }
}

const findOrCreate = async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await GET_DB().collection(USER_COLLECTION_NAME).findOne({
      email: profile.emails[0].value
    })
    if (user) {
      return done(null, user, { isNewUser: false }) // Nếu người dùng đã tồn tại, trả về người dùng
    }

    const newUser = {
      name: profile.displayName,
      email: profile.emails[0].value
    }
    const validata = await validateBeforeCreate(newUser)
    const createUser = await GET_DB().collection(USER_COLLECTION_NAME).insertOne(validata)
    // const result = await GET_DB().collection(USER_COLLECTION_NAME).insertOne(newUser)

    const resultUser = await userModel.findOneById(createUser.insertedId)
    return done(null, resultUser, { isNewUser: true })
  } catch (err) {
    return done(err)
  }
}

const findOneByEmail = async (email) => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOne({
      email: email
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(id)
      })
    // const result = deleteFiled({ object: data, field: INVALID_UPDATE_FIELDS })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Nhiệm vụ của function này là cập nhật push 1 giá trị voà cuối mảng columnOrderIds
const pushColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOneAndUpdate(
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
    Object.keys(updateData).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })
    // Đối với những dữ liệu liên quan ObjectId, biến đổi ở đây
    if (updateData.columnOrderIds) {
      updateData.columnOrderIds = updateData.columnOrderIds.map((_id) => new ObjectId(_id))
    }
    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOneAndUpdate(
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
    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOneAndUpdate(
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

export const userModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
  createNew,
  findOneByEmail,
  findOneById,
  pushColumnOrderIds,
  update,
  pullColumnOrderIds,
  findOrCreate
}
