import { IUserRepository } from "@application/interfaces/repositories/user.interface";
import { userRepository } from "@infrastructure/database/repositories/user.repository";
import { AppError } from "@shared/error/AppError";
import { comparePassword } from "@shared/utils/password";
import { generateTokens } from "@shared/utils/token";
import { sendOtpVerificationUsercase } from "./send-otp.usecase";

export class SignInUsecase {
  constructor(private userRepository: IUserRepository) {}

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

export const signinUsecase = new SignInUsecase(userRepository);
