import { authenticate } from "@infrastructure/middleware/authenticate";
import { uploadSingle } from "@infrastructure/middleware/upload";
import { validator } from "@infrastructure/middleware/validator";
import { UserController } from "@presentation/controllers/user.controller";
import {
  changePasswordSchema,
  resetPasswordSchema,
  sentEmailOtpSchema,
  signinSchema,
  signupSchema,
  verifyOtpSchema,
} from "@presentation/validators/user.validator";
import { Router } from "express";

const UserRouter: Router = Router();

UserRouter.post(
  "/signup",
  uploadSingle("avatar"),
  validator(signupSchema),
  UserController.signup,
)
  .post("/sign-in", validator(signinSchema), UserController.signin)
  .post("/sent-email-otp", authenticate, UserController.sendEmailOtp)
  .post(
    "/verify-otp",
    [authenticate, validator(verifyOtpSchema)],
    UserController.verifyEmail,
  )
  .patch(
    "/change-password",
    [authenticate, validator(changePasswordSchema)],
    UserController.changePassword,
  )
  .post(
    "/forgot-password",
    validator(sentEmailOtpSchema),
    UserController.forgotPassword,
  )
  .patch(
    "/reset-password",
    validator(resetPasswordSchema),
    UserController.resetPassword,
  );

export default UserRouter;
