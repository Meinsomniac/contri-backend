import { uploadSingle } from "@infrastructure/middleware/upload";
import { validator } from "@infrastructure/middleware/validator";
import { UserController } from "@presentation/controllers/user.controller";
import {
  resetPasswordSchema,
  sentEmailOtpSchema,
  signinSchema,
  signupSchema,
} from "@presentation/validators/user.validator";
import { Router } from "express";

const AuthRouter: Router = Router();

AuthRouter.post(
  "/signup",
  uploadSingle("avatar"),
  validator(signupSchema),
  UserController.signup,
)
  .post("/sign-in", validator(signinSchema), UserController.signin)
  .post(
    "/forgot-password",
    validator(sentEmailOtpSchema),
    UserController.forgotPassword,
  )
  .patch(
    "/reset-password",
    validator(resetPasswordSchema),
    UserController.resetPassword,
  )
  .post("/google-signin", UserController.googleSignIn);

export default AuthRouter;
