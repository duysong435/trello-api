import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  /**
   * Mặc định chúng ta không cần phải custom message ở phía BE làm gì vì để cho frontend tự validate và custom message phía BE cho đẹp
   * Back-end chỉ cần validate đảm bảo dữ liệu chuẩn xác, và trả về message mặc định từ thư viện là được 
   * Quan trọng việc validate dữ liêu bắt buộc phải có ở phía BE vì đây là điểm cuối để lưu chữ dữ liệu vào database
   * Và thông thường trong thực tế tốt nhát cho hệ thống là hãy luôn validate dữ liệu ở cả Back-end và front-end 
   */
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict().messages({
      'string.trim': 'Title must not have leading or trailing whitespace',
      'string.empty': 'Title is not allowed to be empty',
      'string.min': 'Title min 3 character',
      'string.max': 'Title min 256 character',
      'any.required': 'Title is require'
    }),
    description: Joi.string().required().min(3).max(256).trim().strict(),

  })
  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    // Validate dữ liệu hợp lệ chuyển sang controller
    next()
  } catch (error) {
    // const errMessage = new Error(error).message
    // const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errMessage)
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))

  }

}

export const boardValidation = {
  createNew
}