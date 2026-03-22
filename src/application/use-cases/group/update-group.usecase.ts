import { IGroupRepository } from "@application/interfaces/repositories/group.interface";
import { Group } from "@domain/entities/group.entity";
import { groupRepository } from "@infrastructure/database/repositories/group.repository";
import CloudinaryService from "@infrastructure/services/cloudinary.service";
import { AppError } from "@shared/error/AppError";
import { SettleSchedule } from "@shared/types/group.types";

type Input = {
  publicId: string;
  name?: string;
  avatar?: Buffer | null;
  note?: string | null;
  settleSchedule?: SettleSchedule | null;
};

export class UpdateGroupUseCase {
  constructor(private repo: IGroupRepository) {}

  async execute(input: Input) {
    const group = await this.repo.findByPublicId(input.publicId);
    if (!group) throw new AppError("Group not found", 404);

    //Upload avatar if provided
    let avatarUrl: string | undefined = undefined;
    if (input.avatar) {
      const result = await CloudinaryService.uploadStream(
        input.avatar,
        "groups/avatars",
      );
      avatarUrl = result.url;
    }

    if (input.name !== undefined) group.name = input.name;
    if (avatarUrl) group.avatar = avatarUrl;
    if (input.note !== undefined) group.note = input.note;
    if (input.settleSchedule !== undefined) {
      group.settleSchedule = input.settleSchedule;
      group.nextSettleAt = Group.computeNextSettleAt(input.settleSchedule);
    }
    return this.repo.update(group);
  }
}

export const updateGroupUseCase = new UpdateGroupUseCase(groupRepository);
