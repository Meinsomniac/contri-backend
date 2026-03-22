import { IGroupRepository } from "@application/interfaces/repositories/group.interface";
import { groupRepository } from "@infrastructure/database/repositories/group.repository";
import { AppError } from "@shared/error/AppError";

export class RemoveMemberUseCase {
  constructor(private repo: IGroupRepository) {}

  async execute(publicId: string, userId: string) {
    const group = await this.repo.findByPublicId(publicId);
    if (!group) throw new AppError("Group not found", 404);
    const member = await this.repo.findMember(group.id, userId);
    if (!member || member.leftAt) throw new AppError("Member not found", 404);
    await this.repo.removeMember(group.id, userId);
  }
}

export const removeMemberUseCase = new RemoveMemberUseCase(groupRepository);
