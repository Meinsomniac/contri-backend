import { addFriendshipUseCase } from "@application/use-cases/friendship/add-friendship.usecase";
import { addMultipleFriendUseCase } from "@application/use-cases/friendship/add-multiple-friend.usecase";
import { getFriendListUseCase } from "@application/use-cases/friendship/get-friendlist.usecase";
import { IdentifierType } from "@infrastructure/database/generated/prisma/enums";
import { AppError } from "@shared/error/AppError";
import { Request, Response } from "express";

export class FriendController {
  static async addFriend(req: Request, res: Response) {
    const userId = req.user?.id;
    const { identifier, identifierType, name } = req.body;

    //Check if user is trying to add himself as friend or not
    if (req.user?.email === identifier || req.user?.phone === identifier) {
      throw new AppError("You cannot add yourself as a friend", 400);
    }

    const result = await addFriendshipUseCase.execute({
      userId: userId as string,
      identifier,
      identifierType,
      name,
    });

    res.status(200).json({ message: "Friend added successfully" });
  }

  static async addMultipleFriend(req: Request, res: Response) {
    const userId = req.user?.id;
    const identifiers: {
      identifier: string;
      identifierType: IdentifierType;
      name: string;
    }[] = req.body;

    const result = await addMultipleFriendUseCase.execute(
      identifiers.map((iden) => ({ ...iden, userId: userId as string })),
    );

    res.status(200).json({ message: "Friends added successfully" });
  }

  static async getFriends(req: Request, res: Response) {
    const userId = req.user?.id;

    const result = await getFriendListUseCase.execute(userId as string);

    res.status(200).json({ sucess: true, friends: result });
  }
}
