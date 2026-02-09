import { IdentifierType } from "@infrastructure/database/generated/prisma/enums";
import { User } from "./user.entity";

type UserWithoutMethods = Omit<
  User,
  "setAvatar" | "generatePublicId" | "setPassword"
>;

export class ContactIdentifier {
  public readonly id: string;
  public userId: string;
  public identifier: string;
  public identifierType: IdentifierType = "EMAIL";
  public createdAt: Date;
  public user?: UserWithoutMethods | null;

  constructor(
    id: string,
    userId: string,
    identifier: string,
    identifierType: IdentifierType,
    user: UserWithoutMethods | null = null,
  ) {
    this.id = id;
    this.userId = userId;
    this.identifier = identifier;
    this.identifierType = identifierType;
    this.user = user;
    this.createdAt = new Date();
  }
}
