import { TransactionClient } from "@infrastructure/database/generated/prisma/internal/prismaNamespace";

export interface IFriendshipRepository {
  create(
    userId: string,
    friendId: string,
    tx?: TransactionClient,
  ): Promise<void>;
  existByIdentifier(userId: string, identifier: string): Promise<boolean>;
  existByFriendId(userId: string, friendId: string): Promise<boolean>;
  // exists(userId: string, friendId: string): Promise<boolean>;
  // findById(id: string): Promise<{ userId: string; friendId: string } | null>;
  // findByUserId(userId: string): Promise<string[]>;
}
