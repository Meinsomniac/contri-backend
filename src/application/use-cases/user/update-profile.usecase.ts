import { IUserRepository } from "@application/interfaces/repositories/user.interface";
import { User } from "@domain/entities/user.entity";
import { userRepository } from "@infrastructure/database/repositories/user.repository";
import { AppError } from "@shared/error/AppError";

export class UpdateProfileUsecase {
  constructor(private userRepo: IUserRepository) {}

  async execute(userDataToUpdate: Partial<User>) {
    const user = await this.userRepo.findById(userDataToUpdate?.id as string);
    if (!user) throw new AppError("User not found", 404);

    if (!user?.emailVerified) throw new AppError("Email not verified", 401);
    if (!user?.isOnboarded) throw new AppError("User not onboarded", 401);

    const { id, name, ...others } = user;
    const updatedUser = new User(id, userDataToUpdate.name || name, {
      ...others,
      currency: userDataToUpdate.currency || user.currency,
      language: userDataToUpdate.language || user.language,
      phone: userDataToUpdate.phone || user.phone,
      updatedAt: new Date(),
    });

    await this.userRepo.update(updatedUser);
    return true;
  }
}

export const updateProfileUsecase = new UpdateProfileUsecase(userRepository);
