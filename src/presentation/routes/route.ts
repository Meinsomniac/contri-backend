import { Router } from "express";
import UserRouter from "./user.route";
import AuthRouter from "./auth.route";
import FriendRouter from "./friendship.route";
import { authenticate } from "@infrastructure/middleware/authenticate";

const router: Router = Router();

router.use("/auth", AuthRouter);
router.use("/user", UserRouter);
router.use("/friendship", authenticate, FriendRouter);

export default router;
