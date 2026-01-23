import { IOtpVerificationRepository } from "@application/interfaces/repositories/otp-verification.interface";
import { IUserRepository } from "@application/interfaces/repositories/user.interface";
import { User } from "@domain/entities/user.entity";
import { VerificationType } from "@infrastructure/database/generated/prisma/enums";
import { otpVerificationRepository } from "@infrastructure/database/repositories/otp-verification.repository";
import { userRepository } from "@infrastructure/database/repositories/user.repository";
import { AppError } from "@shared/error/AppError";
import { compareOtp } from "@shared/utils/password";

type VerifyEmailInputs = {
  otp: string;
  type: VerificationType;
  userId?: string;
  email?: string;
};

export class VerifyOtpUsercase {
  constructor(
    private userRepository: IUserRepository,
    private otpVerificationRepository: IOtpVerificationRepository,
  ) {}

  async execute({ otp, type, userId }: VerifyEmailInputs) {
    //check if user exists
    let user = null;
    if (userId) user = await this.userRepository.findById(userId);

    if (!user) throw new AppError("User does not exists", 404);
    if (user.emailVerified && type === "VERIFY_EMAIL")
      throw new AppError("User email is already verified", 403);

    //fetch otp token of the requested user from db
    const token = await this.otpVerificationRepository.findByUserId(
      user.id,
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
    } else if (isOtpExpired) {
      await this.otpVerificationRepository.deleteById(token.id);
      throw new AppError("Otp expired. Resend Otp and try again", 403);
    } else throw new AppError("Invalid Otp", 403);
  }
}

export const verifyOtpUsecase = new VerifyOtpUsercase(
  userRepository,
  otpVerificationRepository,
);
