import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {

  const correctCondition = Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().required().min(3).max(50).trim().strict()
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))

  }

}

const update = async (req, res, next) => {
  // Lưu ý không dùng hàm require() trong trường hợp update
  const correctCondition = Joi.object({
    //Nếu cần làm tính năng di chuyển Column sang board khác thì mới thêm validate BoardId
    // boardId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().min(3).max(50).trim().strict(),
    cardOrderIds: Joi.array().items(
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

const deleteItem = async (req, res, next) => {

  const correctCondition = Joi.object({
    id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  })
  try {
    await correctCondition.validateAsync(req.params)
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))

  }

}

export const columnValidation = {
  createNew,
  update,
  deleteItem
}