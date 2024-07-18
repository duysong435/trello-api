import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { uploadController } from '~/controllers/uploadController'
import { workspaceController } from '~/controllers/workspaceController'
const Router = express.Router()
Router.route('/').post(uploadController.uploadImage, workspaceController.updateLogoForWorkspace)
export const uploadImage = Router
