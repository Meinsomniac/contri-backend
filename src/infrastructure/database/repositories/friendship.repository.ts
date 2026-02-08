import { IFriendshipRepository } from "@application/interfaces/repositories/friendship.interface";
import { TransactionClient } from "../generated/prisma/internal/prismaNamespace";
import { PrismaClient } from "../generated/prisma/client";
import prisma from "../prisma/prisma";

export class Friendship implements IFriendshipRepository {
  private db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }
  create(
    userId: string,
    friendId: string,
    tx?: TransactionClient,
  ): Promise<void> {
    return Promise.resolve();
  }

  async existByFriendId(userId: string, friendId: string): Promise<boolean> {
    const count = await this.db.friendShip.count({
      where: {
        userId,
        friendId,
      },
    });

    return count > 0;
  }

  existByIdentifier(userId: string, identifier: string): Promise<boolean> {
    const count = this.db.friendShip.findFirst({
      where: {
        userId,
      },
    });
    return Promise.resolve(false);
  }
}

export const friendshipRepository = new Friendship(prisma);
