import { signUpUseCase } from "@application/use-cases/user.usecase";
import { Request, Response } from "express";

export class UserController {
  static async signup(req: Request, res: Response) {
    console.log(req.body);
    const { name, email, phone, password } = req.body;
    const avatar = req.file?.buffer;
    console.log("Buffer", avatar);

    const input = {
      name,
      email,
      phone,
      password,
      avatarBuffer: avatar,
    };

    const {} = await signUpUseCase.execute(input);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  }
}
