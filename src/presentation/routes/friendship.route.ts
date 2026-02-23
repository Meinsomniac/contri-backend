import { FriendController } from "@presentation/controllers/friend.controller";
import { Router } from "express";

const FriendRouter: Router = Router();

FriendRouter.post("/add", FriendController.addFriend);
FriendRouter.post("/add-multiple", FriendController.addMultipleFriend);
FriendRouter.get("/get-friendlist", FriendController.getFriends);

export default FriendRouter;
