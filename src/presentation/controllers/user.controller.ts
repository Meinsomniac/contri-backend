import { verifyOtpUsecase } from "@application/use-cases/common/verify-otp.usercase";
import { changePasswordUsecase } from "@application/use-cases/user/change-password.usecase";
import { forgotPasswordUsecase } from "@application/use-cases/user/forgot-password.usecase";
import { resetPasswordUsecase } from "@application/use-cases/user/reset-password.usecase";
import { sendOtpVerificationUsercase } from "@application/use-cases/user/send-otp.usecase";
import { signinUsecase } from "@application/use-cases/user/signin.usecase";
import { signUpUseCase } from "@application/use-cases/user/signup.usecase";
import { updateProfileUsecase } from "@application/use-cases/user/update-profile.usecase";
import { User } from "@domain/entities/user.entity";
import { Request, Response } from "express";

export class UserController {
  static async signup(req: Request, res: Response) {
    const { name, email, phone, password } = req.body;
    const avatar = req.file?.buffer;

    const input = {
      name,
      email,
      phone,
      password,
      avatarBuffer: avatar,
    };

    const { accessToken, refreshToken, user } =
      await signUpUseCase.execute(input);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        accessToken,
        refreshToken,
        user,
      },
    });
  }

  static async signin(req: Request, res: Response) {
    const { email, password } = req.body;

    const { accessToken, refreshToken } = await signinUsecase.execute(
      email,
      password,
    );

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        accessToken,
        refreshToken,
      },
    });
  }

  static async sendEmailOtp(req: Request, res: Response) {
    const email = req.user?.email;
    await sendOtpVerificationUsercase.execute(email as string);

    res.status(200).json({
      success: true,
      message: "OTP sent. Check your mail for otp.",
    });
  }

  static async verifyEmail(req: Request, res: Response) {
    const { otp } = req.body;
    const userId = req.user?.id;

    await verifyOtpUsecase.execute({
      otp: otp as string,
      type: "VERIFY_EMAIL",
      userId,
    });

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  }

  static async changePassword(req: Request, res: Response) {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user?.id as string;

    await changePasswordUsecase.execute({
      newPassword,
      oldPassword,
      userId,
    });

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  }

  static async forgotPassword(req: Request, res: Response) {
    const { email } = req.query;

    await forgotPasswordUsecase.execute(email as string);
    res.status(200).json({
      success: true,
      message: "Otp has been sent to email for verification.",
    });
  }

  static async resetPassword(req: Request, res: Response) {
    const { email, password, otp } = req.body;

    await resetPasswordUsecase.execute({ email, password, otp });
    res.status(200).json({
      success: true,
      message: "Password has been reset. Try login with new password",
    });
  }

  static async updateProfile(req: Request, res: Response) {
    const data: Partial<User> = req.body;

    const result = await updateProfileUsecase.execute(data);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: result,
    });
  }
}
