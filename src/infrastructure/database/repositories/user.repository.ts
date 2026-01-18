import { IUserRepository } from "@application/interfaces/repositories/user.interface";
import { User } from "@domain/entities/user.entity";
import { PrismaClient, User as DBUser } from "../generated/prisma/client";
import prisma from "../prisma/prisma";
import { TransactionClient } from "../generated/prisma/internal/prismaNamespace";

export class UserRepository implements IUserRepository {
  private db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  private mapToEntity({ id, name, ...dbUser }: DBUser): User {
    return new User(id, name, {
      ...dbUser,
    });
  }

  async create(user: User, tx?: TransactionClient): Promise<User> {
    const client = tx ?? this.db;
    const createdUser = await client.user.create({
      data: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        password: user.password,
        avatar: user.avatar,
        currency: user.currency,
        language: user.language,
        isOnboarded: user.isOnboarded,
      },
    });

    return this.mapToEntity(createdUser);
  }

  async findById(id: string): Promise<User | null> {
    const dbUser = await this.db.user.findUnique({
      where: { id },
    });

    return dbUser ? this.mapToEntity(dbUser) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const dbUser = await this.db.user.findUnique({
      where: { email },
    });

    return dbUser ? this.mapToEntity(dbUser) : null;
  }
  async findByPhone(phone: string): Promise<User | null> {
    const dbUser = await this.db.user.findUnique({
      where: { phone },
    });

    return dbUser ? this.mapToEntity(dbUser) : null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.db.user.count({
      where: { email },
    });
    return count > 0;
  }
  async existsByPhone(phone: string): Promise<boolean> {
    const count = await this.db.user.count({
      where: { phone },
    });
    return count > 0;
  }

  async update(user: User): Promise<User> {
    const updatedUser = await this.db.user.update({
      where: { id: user.id },
      data: {
        ...user,
      },
    });

    return this.mapToEntity(updatedUser);
  }
}

export const userRepository = new UserRepository(prisma);
