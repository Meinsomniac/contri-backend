import { signUpUseCase } from "@application/use-cases/user.usecase";
import { Request, Response } from "express";

export class UserController {
  static async signup(req: Request, res: Response) {
    const { name, email, phone, password } = req.body;
    const avatar = req.file;

    const input = {
      name,
      email,
      phone,
      password,
      avatarUrl: avatar,
    };

    const {} = await signUpUseCase.execute(input);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  }
}
