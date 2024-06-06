/* eslint-disable no-useless-catch */
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
const crypto = require('node:crypto')
import bcrypt from 'bcrypt'
import KeyTokenService from './keyTokenService'
import { createTokenPair } from '~/utils/authUtils'
import { getInfoData } from '~/utils'
import { keyTokenModel } from '~/models/keyTokenModel'

const signUp = async (reqBody) => {
  try {
    const newUser = {
      ...reqBody,
      createdAt: Date.now()
    }

    const holderUser = await userModel.findOneByEmail(newUser.email)

    if (holderUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already registered!')
    }

    newUser.password = bcrypt.hashSync(newUser.password, 10)
    const id = await userModel.createNew(newUser)

    const user = await userModel.findOneById(id.insertedId)

    if (user) {
      const privateKey = crypto.randomBytes(64).toString('hex')
      const publicKey = crypto.randomBytes(64).toString('hex')

      // console.log({ privateKey, publicKey }) //save colection keystore

      const keyStore = await KeyTokenService.createKeyToken({
        userId: user._id,
        publicKey,
        privateKey
      })

      if (!keyStore) {
        return {
          code: 'xxxx',
          message: 'keyStore Error'
        }
      }

      const tokens = await createTokenPair({ userId: user._id, email: user.email }, publicKey, privateKey)

      return {
        code: StatusCodes.CREATED,
        metadata: {
          user: getInfoData({ fields: ['_id', 'name', 'email'], object: user }),
          tokens
        }
      }
    }
    throw new ApiError(StatusCodes.CONFLICT, 'Please login!')
  } catch (error) {
    throw error
  }
}

const login = async ({ email, user, password, refreshToken = null }) => {
  // 1.
  if (!password) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication error')
  const foundUser = await userModel.findOneByEmail(email)

  if (!foundUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Please register account!')

  // 2.
  const match = bcrypt.compare(password, foundUser.password)
  if (!match) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication error')

  // 3.
  // created privateKey, publicKey
  const privateKey = crypto.randomBytes(64).toString('hex')
  const publicKey = crypto.randomBytes(64).toString('hex')

  // 4. Generate tokens
  const { _id: userId } = foundUser
  const tokens = await createTokenPair({ userId, email }, publicKey, privateKey)

  await KeyTokenService.createKeyToken({
    refreshToken: tokens.refreshToken,
    privateKey,
    publicKey,
    userId
  })
  return {
    code: StatusCodes.CREATED,
    metadata: {
      user: getInfoData({
        fields: ['_id', 'name', 'email'],
        object: foundUser
      }),
      tokens
    }
  }
}

const loginWithGoogle = async ({ email }, { isNewUser }) => {
  const foundUser = await userModel.findOneByEmail(email)
  if (!foundUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Please register account!')

  // 2.
  // created privateKey, publicKey
  const privateKey = crypto.randomBytes(64).toString('hex')
  const publicKey = crypto.randomBytes(64).toString('hex')

  // 3. Generate tokens
  const { _id: userId } = foundUser
  const tokens = await createTokenPair({ userId, email }, publicKey, privateKey)

  await KeyTokenService.createKeyToken({
    refreshToken: tokens.refreshToken,
    privateKey,
    publicKey,
    userId
  })
  return {
    code: StatusCodes.CREATED,
    metadata: {
      user: getInfoData({
        fields: ['_id', 'name', 'email'],
        object: foundUser
      }),
      tokens,
      isNewUser
    }
  }
}

const handlerRefreshToken = async ({ keyStore, user, refreshToken }) => {
  const { userId, email } = user
  if (keyStore.refreshTokenUsed.includes(refreshToken)) {
    await KeyTokenService.deleteKeyById(userId)
    throw new ApiError(StatusCodes.FORBIDDEN, 'Something wrong happend !! Pls relogin')
  }

  if (keyStore.refreshToken !== refreshToken) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Shop not registered')

  const foundShop = await userModel.findOneByEmail(email)

  if (!foundShop) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Shop not registered')

  //create 1 cap moi
  const tokens = await createTokenPair({ userId, email }, keyStore.publicKey, keyStore.privateKey)

  await keyTokenModel.updateRefreshToken({
    id: keyStore.userId,
    refreshToken: tokens.refreshToken,
    refreshTokenUsed: refreshToken
  })

  return {
    user,
    tokens
  }
}

const logout = async (keyStore) => {
  const delKey = await KeyTokenService.removeKeyById(keyStore._id)
  return delKey
}

export const userService = {
  signUp,
  login,
  handlerRefreshToken,
  logout,
  loginWithGoogle
}
