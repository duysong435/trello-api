import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardValidation } from '~/validations/boardValidation'
import { authentication } from '~/utils/authUtils'
import { workspaceController } from '~/controllers/workspaceController'
import { uploadController } from '~/controllers/uploadController'
const Router = express.Router()
Router.use(authentication)
Router.route('/get-all-workspace').get(workspaceController.getAllWorkspaceForUser)
Router.route('/update-logo').post(workspaceController.updateLogoForWorkspace)
export const workspaceRoute = Router
