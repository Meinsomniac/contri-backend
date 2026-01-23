import { IUserRepository } from "@application/interfaces/repositories/user.interface";
import { User } from "@domain/entities/user.entity";
import { userRepository } from "@infrastructure/database/repositories/user.repository";

export class UpdateProfileUsecase {
  constructor(private userRepo: IUserRepository) {}

  async execute(userDataToUpdate: Partial<User>) {
    const user = await this.userRepo.findById(userDataToUpdate?.id as string);
    if (!user) throw new Error("User not found");

    if (!user?.emailVerified) throw new Error("Email not verified");
    if (!user?.isOnboarded) throw new Error("User not onboarded");

    const updatedUser = new User(user.id, userDataToUpdate.name || user.name, {
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
