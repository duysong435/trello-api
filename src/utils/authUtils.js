'use strict'

const JWT = require('jsonwebtoken')
const asyncHandler = require('./asyncHandler')

//Service
const { keyTokenModel } = require('~/models/keyTokenModel')
const { default: ApiError } = require('./ApiError')
const { StatusCodes } = require('http-status-codes')
const HEADER = {
  CLIENT_ID: 'x-client-id',
  AUTHORIZATION: 'authorization',
  REFRESHTOKEN: 'x-rtoken-id'
}

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    const accessToken = await JWT.sign(payload, publicKey, {
      // algorithm: 'RS256',
      expiresIn: '2 days'
    })
    const refreshToken = await JWT.sign(payload, privateKey, {
      // algorithm: 'RS256',
      expiresIn: '7 days'
    })

    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        // console.log('error verify::', err)
      } else {
        // console.log('decode verify::', decode)
      }
    })
    return { accessToken, refreshToken }
  } catch (error) {
    throw error
  }
}

const authentication = asyncHandler(async (req, res, next) => {
  const userId = req.headers[HEADER.CLIENT_ID]
  if (!userId) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid Request')

  //2
  const keyStore = await keyTokenModel.findOneById(userId)
  if (!keyStore) throw new ApiError(StatusCodes.NOT_FOUND, 'Not found keyStore')

  //3
  const refreshToken = req.headers[HEADER.REFRESHTOKEN]
  if (refreshToken) {
    try {
      const decodeUser = JWT.verify(refreshToken, keyStore.privateKey)
      if (userId !== decodeUser.userId) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid UserId')
      req.keyStore = keyStore
      req.user = decodeUser
      req.refreshToken = refreshToken
      return next()
    } catch (error) {
      throw error
    }
  }
  const accessToken = req.headers[HEADER.AUTHORIZATION]
  if (!accessToken) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid Request')

  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
    if (userId !== decodeUser.userId) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid UserId')
    req.user = decodeUser
    req.keyStore = keyStore
    return next()
  } catch (error) {
    throw error
  }
})

const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret)
}

module.exports = {
  createTokenPair,
  verifyJWT,
  authentication
}
