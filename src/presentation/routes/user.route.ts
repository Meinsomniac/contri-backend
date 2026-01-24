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
  updateUserProfileSchema,
  verifyOtpSchema,
} from "@presentation/validators/user.validator";
import { Router } from "express";

const AuthRouter: Router = Router();

AuthRouter.post("/sent-email-otp", authenticate, UserController.sendEmailOtp)
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
  .patch(
    "/update-profile",
    [authenticate, validator(updateUserProfileSchema)],
    UserController.updateProfile,
  );

export default AuthRouter;
