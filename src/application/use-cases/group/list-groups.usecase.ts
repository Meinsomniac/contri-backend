import { IGroupRepository } from "@application/interfaces/repositories/group.interface";
import { groupRepository } from "@infrastructure/database/repositories/group.repository";

export class ListGroupsUseCase {
  constructor(private repo: IGroupRepository) {}

  async execute(userId: string) {
    return this.repo.findAllForUser(userId);
  }
}

export const listGroupsUseCase = new ListGroupsUseCase(groupRepository);
