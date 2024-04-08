import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { BOARD_TYPES } from '~/utils/constants'
import { REGULAR_EMAIL, REGULAR_EMAIL_MESSAGE } from '~/utils/validators'
import { columnModel } from './columnModel'
import { cardModel } from './cardModel'
import { deleteFiled } from '~/utils'


const KEY_TOKEN_COLLECTION_NAME = 'keys'
const KEY_TOKEN_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required().min(3).max(100).trim().strict(),
  publicKey: Joi.string().required().min(6).max(250).trim().strict(),
  privateKey: Joi.string().required().pattern(REGULAR_EMAIL).message(REGULAR_EMAIL_MESSAGE).trim().strict(),
  refreshTokenUsed: Joi.string().required().pattern(REGULAR_EMAIL).message(REGULAR_EMAIL_MESSAGE).default([]),
  refreshToken: Joi.string().required().pattern(REGULAR_EMAIL).message(REGULAR_EMAIL_MESSAGE).trim().strict(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// Chỉ định ra những fields mà chúng ta không muốn cho phép cập nhật trong hàm update()
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt', 'updatedAt', '_destroy']

const validateBeforeCreate = async (data) => {
  return await KEY_TOKEN_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createKeyToken = async (data) => {
  try {
    const validata = await validateBeforeCreate(data)

    const createUser = await GET_DB().collection(KEY_TOKEN_COLLECTION_NAME).insertOne(validata)
    return createUser
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {

    const result = await GET_DB().collection(KEY_TOKEN_COLLECTION_NAME).findOne({
      userId: new ObjectId(id)
    })
    // const result = deleteFiled({ object: data, field: INVALID_UPDATE_FIELDS })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const findOneAndUpdate = async ({ filter, update, options }) => {
  try {
    const result = await GET_DB().collection(KEY_TOKEN_COLLECTION_NAME).findOneAndUpdate(
      {
        userId: new ObjectId(filter.userId)

      },
      {
        $set: {
          publicKey: update.publicKey,
          privateKey: update.privateKey,
          refreshToken: update?.refreshToken,
          refreshTokenUsed: update.refreshTokenUsed,
          createdAt: update.createdAt,
          updatedAt: update.updatedAt
        }
      },
      options
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const updateRefreshToken = async ({ id, refreshToken, refreshTokenUsed }) => {
  try {
    const result = await GET_DB().collection(KEY_TOKEN_COLLECTION_NAME).findOneAndUpdate(
      {
        userId: new ObjectId(id)

      },
      {
        $push: {
          refreshTokenUsed: refreshTokenUsed
        },
        $set: {
          refreshToken: refreshToken,
          updatedAt: Date.now()
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
const deleteOne = async (field) => {
  try {
    const result = await GET_DB().collection(KEY_TOKEN_COLLECTION_NAME).deleteOne(field)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const keyTokenModel = {
  KEY_TOKEN_COLLECTION_NAME,
  KEY_TOKEN_COLLECTION_SCHEMA,
  createKeyToken,
  findOneById,
  findOneAndUpdate,
  updateRefreshToken,
  deleteOne
}