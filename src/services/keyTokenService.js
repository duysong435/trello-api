'use strict'

const { ObjectId } = require('mongodb')
const { keyTokenModel } = require('~/models/keyTokenModel')

class KeyTokenService {

  static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
    try {

      const filter = { userId: userId },
        update = {
          publicKey,
          privateKey,
          refreshTokenUsed: [],
          refreshToken,
          createdAt: Date.now()
        }, options = {
          returnDocument: 'after',
          upsert: true
        }
      const tokens = await keyTokenModel.findOneAndUpdate({ filter, update, options })

      return tokens ? tokens.publicKey : null
    } catch (error) {
      return error
    }
  }

  // static findByUserId = async (userId) => {
  //   return await keyTokenModel.findOne({ userId: new Types.ObjectId(userId) })
  // }
  static removeKeyById = async (id) => {
    return await keyTokenModel.deleteOne({ _id: new ObjectId(id) })
  }

  // static findByRefreshTokenUsed = async (refreshToken) => {
  //   return await keyTokenModel.findOne({ refreshTokenUsed: refreshToken }).lean()
  // }
  // static findByRefreshToken = async (refreshToken) => {
  //   return await keyTokenModel.findOneAndUpdate({ refreshToken })
  // }

  static deleteKeyById = async (userId) => {
    return await keyTokenModel.deleteOne({ userId: new ObjectId(userId) })
  }


}

module.exports = KeyTokenService;