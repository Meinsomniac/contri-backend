import { IOtpVerificationRepository } from "@application/interfaces/repositories/otp-verification.interface";
import { IUserRepository } from "@application/interfaces/repositories/user.interface";
import { IEmailService } from "@application/interfaces/services/email.interface";
import { otpVerificationRepository } from "@infrastructure/database/repositories/otp-verification.repository";
import { userRepository } from "@infrastructure/database/repositories/user.repository";
import { emailService } from "@infrastructure/services/email/email.service";
import { AppError } from "@shared/error/AppError";
import { generateTotp, generateTotpSecret } from "@shared/utils/password";
import "dotenv/config";

export class ForgotPasswordUsercase {
  constructor(
    private userRepository: IUserRepository,
    private otpVerificationRepository: IOtpVerificationRepository,
    private emailService: IEmailService,
  ) {}

  async execute(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.isOnboarded)
      throw new AppError("User does not exist with this email");

    //delete any existing token
    const existingToken = await otpVerificationRepository.findByUserId(
      user.id,
      "FORGOT_PASSWORD",
    );
    if (existingToken)
      await this.otpVerificationRepository.deleteById(existingToken.id);

    //Generate new token and store the hash
    const otp = generateTotp();
    const hashOtp = generateTotpSecret(otp);
    const expiresAt = new Date(Date.now() + 3 * 60000);

    await this.otpVerificationRepository.create({
      expiresAt,
      secret: hashOtp,
      userId: user.id,
      type: "FORGOT_PASSWORD",
    });

    await this.emailService.sendMail({
      from: process.env.MAILING_USER as string,
      to: user.email as string,
      subject: "Forgot Password",
      title: "Otp for forgot password email verification",
      template: "otp",
      data: {
        title: "Forgot Password",
        otp,
        duration: "3",
      },
    });
    return true;
  }
}

export const forgotPasswordUsecase = new ForgotPasswordUsercase(
  userRepository,
  otpVerificationRepository,
  emailService,
);
