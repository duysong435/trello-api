import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { BOARD_TYPES } from '~/utils/constants'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { cardModel } from './cardModel'
import { boardeModel } from './boardModel'
const WORKSPACE_COLLECTION_NAME = 'workspace'
const WORKSPACE_COLLECTION_SCHEMA = Joi.object({
  logo: Joi.string().required().min(3).trim().strict().default(''),
  title: Joi.string().required().min(3).max(50).trim().strict().default('Trello Workspace'),
  description: Joi.string().min(3).max(256).trim().strict().default(''),
  auth: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  members: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updateAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})
const updateLogoForWorkspace = async (workspaceId, newLogo) => {
  try {
    const db = await GET_DB()
    console.log(workspaceId)
    console.log(newLogo)
    const workspaceCollection = db.collection(WORKSPACE_COLLECTION_NAME)
    const existingWorkspace = await workspaceCollection.findOne({ _id: new ObjectId(workspaceId) })
    if (!existingWorkspace) {
      throw new Error('Workspace not found')
    }

    const result = await workspaceCollection.findOneAndUpdate({ _id: new ObjectId(workspaceId) }, { $set: { logo: newLogo, updateAt: Date.now() } }, { returnOriginal: false })

    return result
  } catch (error) {
    console.error(`Error updating logo for workspace: ${error.message}`)
    throw new Error(`Error updating logo for workspace: ${error.message}`)
  }
}

const findAllWorkspaceForUser = async (user) => {
  try {
    const userId = user.userId
    console.log(userId)
    const result = await GET_DB()
      .collection(WORKSPACE_COLLECTION_NAME)
      .find({
        $or: [{ auth: new ObjectId(userId) }, { members: new ObjectId(userId) }]
      })
      .toArray()
    return result || null
  } catch (error) {
    console.log(error)
    console.log(1)
    throw new Error(`Error creating workspace: ${error.message}`)
  }
}
const createWorkspace = async (workspaceData) => {
  try {
    const db = await GET_DB()
    const workspaceResult = await db.collection(WORKSPACE_COLLECTION_NAME).insertOne(workspaceData)
    return workspaceResult
  } catch (error) {
    throw new Error(`Error creating workspace: ${error.message}`)
  }
}

export const workspaceModel = {
  WORKSPACE_COLLECTION_NAME,
  WORKSPACE_COLLECTION_SCHEMA,
  findAllWorkspaceForUser,
  updateLogoForWorkspace,
  createWorkspace
}
