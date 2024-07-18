import { workspaceModel } from '~/models/workspaceModel'
import { StatusCodes } from 'http-status-codes'
const getAllWorkspaceForUser = async (req, res, next) => {
  try {
    const result = await workspaceModel.findAllWorkspaceForUser(req.keyStore)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}
const updateLogoForWorkspace = async (req, res, next) => {
  console.log(2222)
  const workspaceId = req.workspaceId
  const newLogo = req.newLogo
  const result = await workspaceModel.updateLogoForWorkspace(workspaceId, newLogo)
  res.status(StatusCodes.OK).json(result)
}
export const workspaceController = {
  getAllWorkspaceForUser,
  updateLogoForWorkspace
}
