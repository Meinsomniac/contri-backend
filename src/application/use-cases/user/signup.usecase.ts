import { IUserRepository } from "@application/interfaces/repositories/user.interface";
import { User } from "@domain/entities/user.entity";
import { userRepository } from "@infrastructure/database/repositories/user.repository";
import CloudinaryService from "@infrastructure/services/cloudinary.service";
import { AppError } from "@shared/error/AppError";
import { hashPassword } from "@shared/utils/password";
import { generateTokens } from "@shared/utils/token";

interface SignUpInput {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  avatarBuffer?: Buffer;
}

interface SignUpOutput {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export class SignUpUsecase {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: SignUpInput): Promise<SignUpOutput> {
    // Vaidate required fields

    if (input.email && (await this.userRepository.existsByEmail(input.email))) {
      throw new AppError("Email already in use", 409);
    }
    if (input.phone && (await this.userRepository.existsByPhone(input.phone))) {
      throw new AppError("Phone number already in use", 409);
    }

    //Hash password
    let hashedPassword: string | undefined = undefined;
    if (input.password) hashedPassword = hashPassword(input.password);

    //Upload avatar if provided
    let avatarUrl: string | undefined = undefined;
    if (input.avatarBuffer) {
      const result = await CloudinaryService.uploadStream(
        input.avatarBuffer,
        "avatars"
      );
      avatarUrl = result.url;
    }

    //Create user entity
    const newUser = new User("", input.name, {
      email: input.email ?? null,
      phone: input.phone ?? null,
      password: hashedPassword ?? null,
      avatar: avatarUrl ?? null,
    });

    //Save user to repository
    const createdUser = await this.userRepository.create(newUser);

    //Generate tokens (placeholder logic)
    const { password, createdAt, updatedAt, ...userInfo } = createdUser;
    const { accessToken, refreshToken } = generateTokens(userInfo);

    return { user: createdUser, accessToken, refreshToken };
  }
}

export const signUpUseCase = new SignUpUsecase(userRepository);
