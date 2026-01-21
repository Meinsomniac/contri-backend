import { IOtpVerificationRepository } from "@application/interfaces/repositories/otp-verification.interface";
import { IUserRepository } from "@application/interfaces/repositories/user.interface";
import { User } from "@domain/entities/user.entity";
import { VerificationType } from "@infrastructure/database/generated/prisma/enums";
import { otpVerificationRepository } from "@infrastructure/database/repositories/otp-verification.repository";
import { userRepository } from "@infrastructure/database/repositories/user.repository";
import { AppError } from "@shared/error/AppError";
import { compareOtp } from "@shared/utils/password";

export class VerifyOtpUsercase {
  constructor(
    private userRepository: IUserRepository,
    private otpVerificationRepository: IOtpVerificationRepository,
  ) {}

  async execute(otp: string, userId: string, type: VerificationType) {
    //check if user exists
    const user = await this.userRepository.findById(userId);
    if (!user) throw new AppError("User does not exists", 404);
    if (user.emailVerified)
      throw new AppError("User email is already verified", 403);

    //fetch otp token of the requested user from db
    const token = await this.otpVerificationRepository.findByUserId(
      userId,
      type,
    );
    if (!token)
      throw new AppError(
        "Otp does not match. Please resend otp and try again.",
        400,
      );

    const isMatch = compareOtp(otp, token?.secret);
    const isOtpExpired = Date.now() > new Date(token.expiresAt).getTime();

    if (isMatch && !isOtpExpired) {
      const { id, name, ...others } = user;
      const updatedUser = new User(id, name, {
        ...others,
        emailVerified: true,
      });
      await this.userRepository.update(updatedUser);
      await this.otpVerificationRepository.deleteById(token.id);
      return true;
    } else if (isOtpExpired)
      throw new AppError("Otp expired. Resend Otp and try again", 403);
    else throw new AppError("Invalid Otp", 403);
  }
}

export const verifyOtpUsecase = new VerifyOtpUsercase(
  userRepository,
  otpVerificationRepository,
);
