import { IFriendshipRepository } from "@application/interfaces/repositories/friendship.interface";
import {
  GetFriendsOutput,
  IUserRepository,
} from "@application/interfaces/repositories/user.interface";
import { friendshipRepository } from "@infrastructure/database/repositories/friendship.repository";
import { userRepository } from "@infrastructure/database/repositories/user.repository";

type FriendListOutput = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
};

export class GetFriendListUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(userId: string): Promise<GetFriendsOutput> {
    const result = await this.userRepo.getFriends(userId);
    return result;
  }
}

export const getFriendListUseCase = new GetFriendListUseCase(userRepository);
