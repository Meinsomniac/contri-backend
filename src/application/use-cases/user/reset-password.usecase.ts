import { IOtpVerificationRepository } from "@application/interfaces/repositories/otp-verification.interface";
import { IUserRepository } from "@application/interfaces/repositories/user.interface";
import { User } from "@domain/entities/user.entity";
import { VerificationType } from "@infrastructure/database/generated/prisma/enums";
import { otpVerificationRepository } from "@infrastructure/database/repositories/otp-verification.repository";
import { userRepository } from "@infrastructure/database/repositories/user.repository";
import { AppError } from "@shared/error/AppError";
import { compareOtp, hashPassword } from "@shared/utils/password";

type ResetPasswordInputs = {
  email: string;
  password: string;
  otp: string;
};

export class ResetPasswordUsecase {
  constructor(
    private userRepository: IUserRepository,
    private otpVerificationRepository: IOtpVerificationRepository,
  ) {}

  async execute(inputs: ResetPasswordInputs) {
    const { email, otp, password } = inputs;
    const type: VerificationType = "FORGOT_PASSWORD";
    //check if user exist
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new AppError("User does not exist.");

    //fetch the generated token
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
      //update password
      const updatedUser = new User(user.id, user.name, {
        ...user,
        password: hashPassword(password),
      });
      await this.userRepository.update(updatedUser);
      await this.otpVerificationRepository.deleteById(token.id);
    }
  }
}

export const resetPasswordUsecase = new ResetPasswordUsecase(
  userRepository,
  otpVerificationRepository,
);
