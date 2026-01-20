import { IUserRepository } from "@application/interfaces/repositories/user.interface";
import { userRepository } from "@infrastructure/database/repositories/user.repository";
import { AppError } from "@shared/error/AppError";
import { comparePassword } from "@shared/utils/password";
import { generateTokens } from "@shared/utils/token";

export class SignInUsecase {
  constructor(private userRepository: IUserRepository) {}

  async execute(email: string, password: string) {
    //fetch user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new AppError("Invalid email or password", 404);
    if (!user.emailVerified)
      throw new AppError("User's email is not verified", 400);

    const isPasswordMatch = comparePassword(password, user.password as string);

    if (!isPasswordMatch) throw new AppError("Invalid email or password");

    //Generate tokens
    const { password: userPassword, ...userData } = user;
    const { accessToken, refreshToken } = generateTokens(userData);

    return { accessToken, refreshToken };
  }
}

export const signinUsecase = new SignInUsecase(userRepository);
