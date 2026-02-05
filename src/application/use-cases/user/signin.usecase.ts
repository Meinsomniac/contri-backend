import { IOtpVerificationRepository } from "@application/interfaces/repositories/otp-verification.interface";
import { IUserRepository } from "@application/interfaces/repositories/user.interface";
import { IEmailService } from "@application/interfaces/services/email.interface";
import { otpVerificationRepository } from "@infrastructure/database/repositories/otp-verification.repository";
import { userRepository } from "@infrastructure/database/repositories/user.repository";
import { emailService } from "@infrastructure/services/email/email.service";
import { AppError } from "@shared/error/AppError";
import { comparePassword } from "@shared/utils/password";
import { generateTokens } from "@shared/utils/token";
import {
  sendOtpVerificationUsercase,
  SendVerificationOtpUsecase,
} from "./send-otp.usecase";

export class SignInUsecase {
  constructor(
    private userRepository: IUserRepository,
    private otpVerificationRepository: IOtpVerificationRepository,
    private emalService: IEmailService,
  ) {}

  async execute(email: string, password: string) {
    //fetch user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.isOnboarded)
      throw new AppError("Invalid email or password", 404);

    const isPasswordMatch = comparePassword(password, user.password as string);

    if (!isPasswordMatch) throw new AppError("Invalid email or password");

    let sendForEmailVerification = false;
    if (!user.emailVerified) {
      sendForEmailVerification = await sendOtpVerificationUsercase.execute(
        email,
        user,
      );
    }

    //Generate tokens
    const { createdAt, updatedAt, ...userData } = user;
    const { accessToken, refreshToken } = generateTokens(userData);

    return {
      accessToken,
      refreshToken,
      user: userData,
      sendForEmailVerification,
    };
  }
}

export const signinUsecase = new SignInUsecase(
  userRepository,
  otpVerificationRepository,
  emailService,
);
