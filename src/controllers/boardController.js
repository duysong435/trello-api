import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
const createNew = async (req, res, next) => {
  try {

    // console.log(req.body)
    // console.log(req.query)
    // console.log(req.params)
    // console.log(req.files)
    // console.log(req.cookies)
    // console.log(req.jwtDecoded)
    //Điều hướng sang tầng service
    // Có kết quả thì trả về phía client

    res.status(StatusCodes.CREATED).json({ message: 'API v1 post board' })
  } catch (error) { next(error) }
}

export const boardController = {
  createNew
}