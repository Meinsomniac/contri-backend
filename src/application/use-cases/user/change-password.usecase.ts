import { IUserRepository } from "@application/interfaces/repositories/user.interface";
import { User } from "@domain/entities/user.entity";
import { userRepository } from "@infrastructure/database/repositories/user.repository";
import { AppError } from "@shared/error/AppError";
import { comparePassword, hashPassword } from "@shared/utils/password";

type ChangePasswordInput = {
  oldPassword: string;
  newPassword: string;
  userId: string;
};

export class ChangePasswordUsercase {
  constructor(private userRepository: IUserRepository) {}

  async execute(inputs: ChangePasswordInput) {
    const { newPassword, oldPassword, userId } = inputs;

    //fetch user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError("User does not exists", 404);
    }

    //check if old password is correct
    const isOldPasswordCorrect = comparePassword(
      oldPassword,
      user.password as string,
    );
    if (!isOldPasswordCorrect)
      throw new AppError("Old password is incorrect.", 403);

    //Check if user is not using same old password
    if (oldPassword === newPassword)
      throw new AppError(
        "New password cannot be the same as your current password",
        403,
      );

    const updatedUser = new User(user.id, user.name, {
      ...user,
      password: hashPassword(newPassword),
    });

    //update user
    await userRepository.update(updatedUser);
  }
}

export const changePasswordUsecase = new ChangePasswordUsercase(userRepository);
