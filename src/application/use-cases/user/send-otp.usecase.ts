import { IOtpVerificationRepository } from "@application/interfaces/repositories/otp-verification.interface";
import { IUserRepository } from "@application/interfaces/repositories/user.interface";
import { IEmailService } from "@application/interfaces/services/email.interface";
import { User } from "@domain/entities/user.entity";
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
    private emailService: IEmailService,
  ) {}

  async execute(email: string, _user?: User | null) {
    //Check if user exists
    let user = _user;
    if (!_user) {
      user = await this.userRepository.findByEmail(email);
    }
    if (!user || !user.isOnboarded) throw new AppError("User not found", 404);

    //check if user is already verified
    if (user.emailVerified) throw new AppError("User is already verified", 403);

    //delete any existing token for the user
    const existingToken = await this.otpVerificationRepository.findByUserId(
      user.id,
      "VERIFY_EMAIL",
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
      type: "VERIFY_EMAIL",
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
    return true;
  }
}

export const sendOtpVerificationUsercase = new SendVerificationOtpUsecase(
  userRepository,
  otpVerificationRepository,
  emailService,
);
