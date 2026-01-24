import { Router } from "express";
import UserRouter from "./user.route";
import AuthRouter from "./auth.route";

const router: Router = Router();

router.use("/user", UserRouter);
router.use("/auth", AuthRouter);

export default router;
