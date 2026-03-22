import { IGroupRepository } from "@application/interfaces/repositories/group.interface";
import { groupRepository } from "@infrastructure/database/repositories/group.repository";
import { AppError } from "@shared/error/AppError";

export class SetMemberAdminUseCase {
  constructor(private repo: IGroupRepository) {}

  async execute(publicId: string, userId: string, isAdmin: boolean) {
    const group = await this.repo.findByPublicId(publicId);
    if (!group) throw new AppError("Group not found", 404);
    const member = await this.repo.findMember(group.id, userId);
    if (!member || member.leftAt) throw new AppError("Member not found", 404);

    if (!isAdmin && member.isAdmin) {
      const adminCount = await this.repo.getActiveAdminCount(group.id);
      if (adminCount <= 1) throw new AppError("Group needs at least one admin", 400);
    }

    await this.repo.setMemberAdmin(group.id, userId, isAdmin);
  }
}

export const setMemberAdminUseCase = new SetMemberAdminUseCase(groupRepository);
