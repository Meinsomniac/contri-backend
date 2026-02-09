import { IContactIdentifierRepository } from "@application/interfaces/repositories/contact.interface";
import { IFriendshipRepository } from "@application/interfaces/repositories/friendship.interface";
import { IUserRepository } from "@application/interfaces/repositories/user.interface";
import { User } from "@domain/entities/user.entity";
import {
  IdentifierType,
  PrismaClient,
} from "@infrastructure/database/generated/prisma/client";
import prisma from "@infrastructure/database/prisma/prisma";
import { contactRepository } from "@infrastructure/database/repositories/contact.repository";
import { friendshipRepository } from "@infrastructure/database/repositories/friendship.repository";
import { userRepository } from "@infrastructure/database/repositories/user.repository";
import { AppError } from "@shared/error/AppError";

type AddFriendshipInput = {
  userId: string;
  identifier: string;
  identifierType: IdentifierType;
  name: string;
};

export class AddFriendshipUseCase {
  constructor(
    private friendshipRepo: IFriendshipRepository,
    private userRepo: IUserRepository,
    private db: PrismaClient,
  ) {}

  async execute(inputs: AddFriendshipInput): Promise<boolean> {
    const { userId, identifier, identifierType, name } = inputs;

    let friendToAdd: Omit<
      User,
      "setAvatar" | "setPassword" | "generatePublicId"
    > | null = null;

    if (identifierType === "EMAIL") {
      friendToAdd = await this.userRepo.findByEmail(identifier);
    } else {
      friendToAdd = await this.userRepo.findByPhone(identifier);
    }

    //check if the friendship already exists
    if (friendToAdd) {
      const isAlreadyFriend = await this.friendshipRepo.existByFriendId(
        userId,
        friendToAdd.id,
      );
      if (isAlreadyFriend) {
        throw new AppError("Friendship already exists", 400);
      }
    }

    const result: boolean = await this.db.$transaction(async (tx) => {
      //Create a placeholder user if the friend doesn't exist
      if (!friendToAdd) {
        const userToCreate = new User("", name, {
          email: identifierType === "EMAIL" ? identifier : undefined,
          phone: identifierType === "PHONE" ? identifier : undefined,
          isPlaceholder: true,
        });
        friendToAdd = await tx.user.create({
          data: {
            publicId: userToCreate.publicId,
            email: userToCreate.email,
            phone: userToCreate.phone,
            name,
            isPlaceholder: true,
          },
        });

        //Create contact identifier if it doesn't exist for future linking when user onboards
        await tx.contactIdentifier.create({
          data: {
            userId: friendToAdd.id,
            identifier,
            identifierType,
          },
        });
      }

      await tx.friendShip.create({
        data: {
          userId,
          friendId: friendToAdd.id,
          displayName: name,
        },
      });
      return true;
    });

    return result;
  }
}

export const addFriendshipUseCase = new AddFriendshipUseCase(
  friendshipRepository,
  userRepository,
  prisma,
);
