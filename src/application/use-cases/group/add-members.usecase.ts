import { IGroupRepository } from "@application/interfaces/repositories/group.interface";
import { groupRepository } from "@infrastructure/database/repositories/group.repository";
import { AppError } from "@shared/error/AppError";

export class AddMembersUseCase {
  constructor(private repo: IGroupRepository) {}

  async execute(publicId: string, userIds: string[]) {
    const group = await this.repo.findByPublicId(publicId);
    if (!group) throw new AppError("Group not found", 404);
    await this.repo.addMembers(group.id, userIds);
  }
}

export const addMembersUseCase = new AddMembersUseCase(groupRepository);
