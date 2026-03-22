import { Router } from "express";
import UserRouter from "./user.route";
import AuthRouter from "./auth.route";
import FriendRouter from "./friendship.route";
import { authenticate } from "@infrastructure/middleware/authenticate";
import GroupRouter from "./group.route";
import ExpenseRouter from "./expense.route";

const router: Router = Router();

router.use("/auth", AuthRouter);
router.use("/user", UserRouter);
router.use("/friendship", authenticate, FriendRouter);
router.use("/groups", GroupRouter);
router.use("/expenses", ExpenseRouter);

export default router;
