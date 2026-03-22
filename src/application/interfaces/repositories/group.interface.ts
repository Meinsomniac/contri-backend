import { Group, GroupMember } from "@domain/entities/group.entity";
import { TransactionClient } from "@infrastructure/database/generated/prisma/internal/prismaNamespace";

export interface IGroupRepository {
  create(group: Group, creatorId: string, tx?: TransactionClient): Promise<Group>;
  findByPublicId(publicId: string): Promise<Group | null>;
  findAllForUser(userId: string): Promise<Group[]>;
  update(group: Group, tx?: TransactionClient): Promise<Group>;
  softDelete(groupId: string, tx?: TransactionClient): Promise<void>;
  archive(groupId: string, isArchived: boolean, tx?: TransactionClient): Promise<void>;

  addMembers(groupId: string, userIds: string[], tx?: TransactionClient): Promise<void>;
  removeMember(groupId: string, userId: string, tx?: TransactionClient): Promise<void>;
  setMemberAdmin(
    groupId: string,
    userId: string,
    isAdmin: boolean,
    tx?: TransactionClient,
  ): Promise<void>;
  getActiveAdminCount(groupId: string, tx?: TransactionClient): Promise<number>;
  findMember(groupId: string, userId: string): Promise<GroupMember | null>;
}
