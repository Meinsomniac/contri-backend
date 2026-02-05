import "dotenv/config";
import { googleClient } from "@infrastructure/config/oAuth.config";
import { OAuth2Client } from "google-auth-library";
import { userRepository } from "@infrastructure/database/repositories/user.repository";
import { IUserRepository } from "@application/interfaces/repositories/user.interface";
import { AppError } from "@shared/error/AppError";
import { User } from "@domain/entities/user.entity";
import prisma from "@infrastructure/database/prisma/prisma";
import { PrismaClient } from "@infrastructure/database/generated/prisma/client";
import { generateTokens } from "@shared/utils/token";

export class GoogleSignInUseCase {
  constructor(
    private googleClient: OAuth2Client,
    private userRepo: IUserRepository,
    private db: PrismaClient,
  ) {}
  async execute(idToken: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error("Invalid Google ID token");
    }

    const email = payload.email;
    const name = payload.name;
    const googleId = payload.sub;
    const avatar = payload.picture;

    if (!email || !name || !googleId) {
      throw new Error("Missing required user information from Google");
    }

    let result = null;
    let user = await this.userRepo.findByEmail(email);
    if (user?.id && user.authProvider !== "GOOGLE") {
      const updatedUser = new User(user.id, user.name, {
        ...user,
        authProvider: "GOOGLE",
        authId: googleId,
        isOnboarded: true,
        emailVerified: true,
        avatar,
      });
      await this.userRepo.update(updatedUser);
      const { createdAt, updatedAt, ...userInfo } = updatedUser;
      const { accessToken, refreshToken } = generateTokens(userInfo);
      result = { user: userInfo, accessToken, refreshToken };
    } else if (!user) {
      const newUser = new User("", name, {
        email,
        emailVerified: true,
        avatar,
        authProvider: "GOOGLE",
        authId: googleId,
        isOnboarded: true,
      });

      result = await this.db.$transaction(async (tx) => {
        const createdUser = await this.userRepo.create(newUser, tx);
        const { createdAt, updatedAt, ...userInfo } = createdUser;
        const { accessToken, refreshToken } = generateTokens(userInfo);
        return { user: userInfo, accessToken, refreshToken };
      });
    } else if (user.authProvider === "GOOGLE") {
      const { createdAt, updatedAt, ...userInfo } = user;
      const { accessToken, refreshToken } = generateTokens(userInfo);
      result = { user: userInfo, accessToken, refreshToken };
    } else {
      throw new AppError(
        "Email already in use with a different authentication method",
        409,
      );
    }

    return result;
  }
}

export const googleSignInUseCase = new GoogleSignInUseCase(
  googleClient,
  userRepository,
  prisma,
);
