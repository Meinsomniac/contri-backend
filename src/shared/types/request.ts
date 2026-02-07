import { User } from "@domain/entities/user.entity";

declare module "express" {
  interface Request {
    user?: Omit<User, "setAvatar" | "setPassword" | "generatePublicId">;
  }
}
