import { IGroupRepository } from "@application/interfaces/repositories/group.interface";
import { Group } from "@domain/entities/group.entity";
import { groupRepository } from "@infrastructure/database/repositories/group.repository";
import CloudinaryService from "@infrastructure/services/cloudinary.service";
import { SettleSchedule } from "@shared/types/group.types";

type Input = {
  name: string;
  avatar?: Buffer;
  note?: string;
  settleSchedule?: SettleSchedule;
  createdBy: string;
};

export class CreateGroupUseCase {
  constructor(private repo: IGroupRepository) {}

  async execute(input: Input) {
    console.log("input", input);
    const nextSettleAt = Group.computeNextSettleAt(input.settleSchedule ?? null);

    //Upload avatar if provided
    let avatarUrl: string | undefined = undefined;
    if (input.avatar) {
      const result = await CloudinaryService.uploadStream(
        input.avatar,
        "groups/avatars",
      );
      avatarUrl = result.url;
    }
    const group = new Group("", input.name, input.createdBy, {
      avatar: avatarUrl ?? null,
      note: input.note ?? null,
      settleSchedule: input.settleSchedule ?? null,
      nextSettleAt,
    });
    return this.repo.create(group, input.createdBy);
  }
}

export const createGroupUseCase = new CreateGroupUseCase(groupRepository);
