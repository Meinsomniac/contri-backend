import { IGroupRepository } from "@application/interfaces/repositories/group.interface";
import { groupRepository } from "@infrastructure/database/repositories/group.repository";
import { AppError } from "@shared/error/AppError";

export class ArchiveGroupUseCase {
  constructor(private repo: IGroupRepository) {}

  async execute(publicId: string) {
    const group = await this.repo.findByPublicId(publicId);
    if (!group) throw new AppError("Group not found", 404);
    const isArchived = !group.isArchived;
    await this.repo.archive(group.id, isArchived);
    return isArchived;
  }
}

export const archiveGroupUseCase = new ArchiveGroupUseCase(groupRepository);
