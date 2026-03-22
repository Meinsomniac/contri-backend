import { User } from "@domain/entities/user.entity";
import { Group, GroupMember } from "@domain/entities/group.entity";

declare module "express" {
  interface Request {
    user?: Omit<User, "setAvatar" | "setPassword" | "generatePublicId">;
    group?: Group;
    membership?: GroupMember;
  }
}
