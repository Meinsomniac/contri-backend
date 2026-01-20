import { IOtpVerificationRepository } from "@application/interfaces/repositories/otp-verification.interface";
import { IUserRepository } from "@application/interfaces/repositories/user.interface";
import { IEmailService } from "@application/interfaces/services/email.interface";
import { otpVerificationRepository } from "@infrastructure/database/repositories/otp-verification.repository";
import { userRepository } from "@infrastructure/database/repositories/user.repository";
import { emailService } from "@infrastructure/services/email/email.service";
import { AppError } from "@shared/error/AppError";
import { generateTotp, generateTotpSecret } from "@shared/utils/password";
import "dotenv/config";

export class SendVerificationOtpUsecase {
  constructor(
    private userRepository: IUserRepository,
    private otpVerificationRepository: IOtpVerificationRepository,
    private emailService: IEmailService
  ) {}

  async execute(email: string) {
    //Check if user exists
    let user = null;
    user = await this.userRepository.findByEmail(email);
    if (!user || !user.isOnboarded) throw new AppError("User not found", 404);

    //check if user is already verified
    if (user.emailVerified) throw new AppError("User is already verified", 403);

    //delete any existing token for the user
    const existingToken = await this.otpVerificationRepository.findByUserId(
      user.id
    );
    if (existingToken)
      await this.otpVerificationRepository.deleteById(existingToken.id);

    //Generate new token and store the hash
    const otp = generateTotp();
    const hashedOtp = generateTotpSecret(otp);
    const expiresAt = new Date(Date.now() + 3 * 60000);

    await this.otpVerificationRepository.create({
      expiresAt,
      secret: hashedOtp,
      userId: user.id,
    });

    await this.emailService.sendMail({
      from: process.env.MAILING_USER as string,
      to: user.email as string,
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
}

export const sendOtpVerificationUsercase = new SendVerificationOtpUsecase(
  userRepository,
  otpVerificationRepository,
  emailService
);
