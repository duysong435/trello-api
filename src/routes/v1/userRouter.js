import express from "express";
import { userValidation } from "~/validations/userValidation";
import { userController } from "~/controllers/userController";
import { authentication } from "~/utils/authUtils";
const Router = express.Router();

Router.route("/signup").post(userValidation.signUp, userController.signUp);
Router.route("/login").post(userValidation.login, userController.login);

// Router.use(authentication);

Router.route("/handlerRefreshToken").post(userController.handlerRefreshToken);
Router.route("/logout").post(userController.logout);

//google auth sign in router

export const userRouter = Router;
