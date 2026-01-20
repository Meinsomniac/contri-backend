import { authenticate } from "@infrastructure/middleware/authenticate";
import { uploadSingle } from "@infrastructure/middleware/upload";
import { validator } from "@infrastructure/middleware/validator";
import { UserController } from "@presentation/controllers/user.controller";
import {
  changePasswordSchema,
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
  .post(
    "/change-password",
    validator(changePasswordSchema),
    UserController.changePassword,
  );

export default UserRouter;
