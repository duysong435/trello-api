import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { userController } from '~/controllers/userController'
import passport from 'passport'

const Router = express.Router()

Router.route('/google').get(passport.authenticate('google', { scope: ['profile', 'email'] }))

Router.route('/google/callback').get(
  passport.authenticate('google', {
    // thất bại
    failureRedirect: 'http://localhost:5173/login'
  }),
  // gọi thằng này nếu callback gg auth thành công
  userController.RedirectToPostAuth
)

Router.route('/checkNewUser').get(userController.CheckStatusNewUser)

Router.route('/login/success').get(userController.loginWithGoogle)

export const passportGGAuth = Router
