import { IOtpVerificationRepository } from "@application/interfaces/repositories/otp-verification.interface";
import { IUserRepository } from "@application/interfaces/repositories/user.interface";
import { IEmailService } from "@application/interfaces/services/email.interface";
import { User } from "@domain/entities/user.entity";
import { PrismaClient } from "@infrastructure/database/generated/prisma/client";
import prisma from "@infrastructure/database/prisma/prisma";
import { otpVerificationRepository } from "@infrastructure/database/repositories/otp-verification.repository";
import { userRepository } from "@infrastructure/database/repositories/user.repository";
import CloudinaryService from "@infrastructure/services/cloudinary.service";
import { emailService } from "@infrastructure/services/email/email.service";
import { AppError } from "@shared/error/AppError";
import {
  generateTotp,
  generateTotpSecret,
  hashPassword,
} from "@shared/utils/password";
import { generateTokens } from "@shared/utils/token";

interface SignUpInput {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  avatarBuffer?: Buffer;
}

interface SignUpOutput {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export class SignUpUsecase {
  constructor(
    private userRepository: IUserRepository,
    private emailService: IEmailService,
    private db: PrismaClient,
  ) {}

  async execute(input: SignUpInput): Promise<SignUpOutput> {
    // Vaidate required fields

    if (input.email && (await this.userRepository.existsByEmail(input.email))) {
      throw new AppError("Email already in use", 409);
    }
    if (input.phone && (await this.userRepository.existsByPhone(input.phone))) {
      throw new AppError("Phone number already in use", 409);
    }

    //Hash password
    let hashedPassword: string | undefined = undefined;
    if (input.password) hashedPassword = hashPassword(input.password);

    //Upload avatar if provided
    let avatarUrl: string | undefined = undefined;
    if (input.avatarBuffer) {
      const result = await CloudinaryService.uploadStream(
        input.avatarBuffer,
        "avatars",
      );
      avatarUrl = result.url;
    }

    //Create user entity
    const newUser = new User("", input.name, {
      email: input.email ?? null,
      phone: input.phone ?? null,
      password: hashedPassword ?? null,
      avatar: avatarUrl ?? null,
      isOnboarded: true,
    });

    let createdUser = {} as User;
    this.db.$transaction(async (tx) => {
      //Save user to repository
      createdUser = await this.userRepository.create(newUser, tx);

      //send otp for email verification
      const otp = generateTotp();
      const hashedOtp = generateTotpSecret(otp);
      const expiresAt = new Date(Date.now() + 3 * 60000);

      const otpToken = await otpVerificationRepository.create(
        {
          secret: hashedOtp,
          userId: createdUser.id,
          expiresAt,
          type: "VERIFY_EMAIL",
        },
        tx,
      );

      if (otpToken) {
        await this.emailService.sendMail({
          from: process.env.MAILING_USER as string,
          to: createdUser.email as string,
          subject: "Email Verification",
          title: "Otp for email verification",
          template: "otp",
          data: {
            title: "Email Verification",
            otp,
            duration: "3",
          },
        });
      }
    });

    //Generate tokens (placeholder logic)
    const { password, createdAt, updatedAt, ...userInfo } = createdUser;
    const { accessToken, refreshToken } = generateTokens(userInfo);

    return { user: createdUser, accessToken, refreshToken };
  }
}

export const signUpUseCase = new SignUpUsecase(
  userRepository,
  emailService,
  prisma,
);
