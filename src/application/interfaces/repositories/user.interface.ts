import { User } from "@domain/entities/user.entity";
import { TransactionClient } from "@infrastructure/database/generated/prisma/internal/prismaNamespace";

export interface IUserRepository {
  create(user: User, tx?: TransactionClient): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  existsByEmail(email: string): Promise<boolean>;
  existsByPhone(phone: string): Promise<boolean>;
  update(user: User): Promise<User>;
}
