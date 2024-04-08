import { StatusCodes } from 'http-status-codes'
// import ApiError from '~/utils/ApiError'
import { userService } from '~/services/userService'

const signUp = async (req, res, next) => {
  try {

    const createUser = await userService.signUp(req.body)
    res.status(StatusCodes.CREATED).json(createUser)
  } catch (error) { next(error) }
}
const login = async (req, res, next) => {
  try {

    const createUser = await userService.login(req.body)
    res.status(StatusCodes.CREATED).json(createUser)
  } catch (error) { next(error) }
}

const handlerRefreshToken = async (req, res, next) => {
  try {

    const createUser = await userService.handlerRefreshToken({
      refreshToken: req.refreshToken,
      user: req.user,
      keyStore: req.keyStore
    })
    res.status(StatusCodes.CREATED).json(createUser)
  } catch (error) { next(error) }
}

const logout = async (req, res, next) => {
  try {

    const createUser = await userService.logout(req.keyStore)
    res.status(StatusCodes.CREATED).json(createUser)
  } catch (error) { next(error) }
}

export const userController = {
  signUp,
  login,
  handlerRefreshToken,
  logout
}