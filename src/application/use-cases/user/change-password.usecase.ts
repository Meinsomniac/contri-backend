import { IUserRepository } from "@application/interfaces/repositories/user.interface";
import { AppError } from "@shared/error/AppError";

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
    if (!user) throw new AppError("User does not exists", 404);
  }
}
