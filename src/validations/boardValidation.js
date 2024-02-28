import Joi, { required } from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { BOARD_TYPES } from '~/utils/constants'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'


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
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),


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

const update = async (req, res, next) => {
  // Lưu ý không dùng hàm require() trong trường hợp update
  const correctCondition = Joi.object({
    title: Joi.string().min(3).max(50).trim().strict(),
    description: Joi.string().min(3).max(256).trim().strict(),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE),
    columnOrderIds: Joi.array().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    )
  })
  try {
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      //  Đối với trường hợp update, cho phép Unknow để không cần đẩy một sô field lên
      allowUnknown: true
    })
    // Validate dữ liệu hợp lệ chuyển sang controller
    next()
  } catch (error) {
    // const errMessage = new Error(error).message
    // const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errMessage)
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))

  }

}

const moveCardToDifferentColumn = async (req, res, next) => {
  const correctCondition = Joi.object({
    currentCardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    prevColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    prevCardOrderIds: Joi.array().required().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ),
    nextColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    nextCardOrderIds: Joi.array().required().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    )
  })
  try {
    await correctCondition.validateAsync(req.body, {
      abortEarly: false
    })
    next()
  } catch (error) {
    // const errMessage = new Error(error).message
    // const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errMessage)
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))

  }

}

export const boardValidation = {
  createNew,
  update,
  moveCardToDifferentColumn
}