import { IdentifierType } from "@infrastructure/database/generated/prisma/enums";
import { addFriendshipUseCase } from "./add-friendship.usecase";

type AddFriendshipInput = {
  userId: string;
  identifier: string;
  identifierType: IdentifierType;
  name: string;
};

export class AddMultipleFriendUseCase {
  async execute(inputs: AddFriendshipInput[]): Promise<boolean[]> {
    const promises: Promise<boolean>[] = [];
    for (const input of inputs) {
      const { userId, identifier, identifierType, name } = input;
      promises.push(
        addFriendshipUseCase.execute({
          userId,
          identifier,
          identifierType,
          name,
        }),
      );
    }

    return Promise.allSettled(promises).then((results) => {
      return results.map((result) => {
        if (result.status === "fulfilled") {
          return result.value;
        } else {
          return false;
        }
      });
    });
  }
}

export const addMultipleFriendUseCase = new AddMultipleFriendUseCase();
