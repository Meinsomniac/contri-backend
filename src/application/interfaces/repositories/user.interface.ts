import { User } from "@domain/entities/user.entity";
import {
  TransactionClient,
  UserDelegate,
} from "@infrastructure/database/generated/prisma/internal/prismaNamespace";

export type GetFriendsOutput = {
  friends: {
    id: string;
    displayName: string;
    friend: {
      name: string;
      id: string;
      email: string | null;
      phone: string | null;
    };
  }[];
  friendOf: {
    id: string;
    user: {
      name: string;
      id: string;
      email: string | null;
      phone: string | null;
    };
  }[];
} | null;

export interface IUserRepository {
  create(user: User, tx?: TransactionClient): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  getFriends(userId: string): Promise<GetFriendsOutput>;
  existsByEmail(email: string): Promise<boolean>;
  existsByPhone(phone: string): Promise<boolean>;
  update(user: User): Promise<User>;
}
