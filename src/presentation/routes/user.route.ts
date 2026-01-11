import { uploadSingle } from "@infrastructure/middleware/upload";
import { validator } from "@infrastructure/middleware/validator";
import { UserController } from "@presentation/controllers/user.controller";
import { signupSchema } from "@presentation/validators/signup.validator";
import { Router } from "express";

const UserRouter: Router = Router();

UserRouter.post(
  "/signup",
  uploadSingle("avatar"),
  validator(signupSchema),
  UserController.signup
);

export default UserRouter;
