import { uploadSingle } from "@infrastructure/middleware/upload";
import { validator } from "@infrastructure/middleware/validator";
import { UserController } from "@presentation/controllers/user.controller";
import {
  sentEmailOtpSchema,
  signupSchema,
} from "@presentation/validators/user.validator";
import { Router } from "express";

const UserRouter: Router = Router();

UserRouter.post(
  "/signup",
  uploadSingle("avatar"),
  validator(signupSchema),
  UserController.signup
).post(
  "/sent-email-otp",
  validator(sentEmailOtpSchema),
  UserController.sendEmailOtp
);

export default UserRouter;
