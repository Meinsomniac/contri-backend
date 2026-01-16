import { sendOtpVerificationUsercase } from "@application/use-cases/user/send-otp.usercase";
import { signUpUseCase } from "@application/use-cases/user/signup.usecase";
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

    const { accessToken, refreshToken } = await signUpUseCase.execute(input);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        accessToken,
        refreshToken,
      },
    });
  }

  static async sendEmailOtp(req: Request, res: Response) {
    const { email } = req.body;

    await sendOtpVerificationUsercase.execute(email);

    res.status(200).json({
      success: true,
      message: "OTP sent. Check your mail for otp.",
    });
  }

  static async verifyEmail(req: Request, res: Response) {}
}
