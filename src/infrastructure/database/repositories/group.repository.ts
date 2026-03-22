import { IGroupRepository } from "@application/interfaces/repositories/group.interface";
import { Group, GroupMember } from "@domain/entities/group.entity";
import { PrismaClient } from "@infrastructure/database/generated/prisma/client";
import { TransactionClient } from "@infrastructure/database/generated/prisma/internal/prismaNamespace";
import prisma from "@infrastructure/database/prisma/prisma";

class GroupRepository implements IGroupRepository {
  constructor(private db: PrismaClient) {}

  private mapMember(row: {
    groupId: string;
    userId: string;
    isAdmin: boolean;
    joinedAt: Date;
    leftAt: Date | null;
  }): GroupMember {
    return new GroupMember(
      row.groupId,
      row.userId,
      row.isAdmin,
      row.joinedAt,
      row.leftAt,
    );
  }

  private mapGroup(row: any): Group {
    return new Group(row.id, row.name, row.createdBy, {
      publicId: row.publicId,
      avatar: row.avatar,
      note: row.note,
      settleSchedule: row.settleSchedule,
      nextSettleAt: row.nextSettleAt,
      isArchived: row.isArchived,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
      members: row.members?.map((member: any) => this.mapMember(member)) ?? [],
    });
  }

  async create(group: Group, creatorId: string, tx?: TransactionClient): Promise<Group> {
    const client = tx ?? this.db;
    const created = await client.group.create({
      data: {
        publicId: group.publicId,
        name: group.name,
        avatar: group.avatar,
        note: group.note,
        settleSchedule: group.settleSchedule ?? undefined,
        nextSettleAt: group.nextSettleAt,
        createdBy: creatorId,
        members: {
          create: {
            userId: creatorId,
            isAdmin: true,
          },
        },
      },
      include: { members: true },
    });
    return this.mapGroup(created);
  }

  async findByPublicId(publicId: string): Promise<Group | null> {
    const row = await this.db.group.findFirst({
      where: { publicId, deletedAt: null },
      include: { members: true },
    });
    return row ? this.mapGroup(row) : null;
  }

  async findAllForUser(userId: string): Promise<Group[]> {
    const rows = await this.db.group.findMany({
      where: { deletedAt: null, members: { some: { userId, leftAt: null } } },
      include: { members: true },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row) => this.mapGroup(row));
  }

  async update(group: Group, tx?: TransactionClient): Promise<Group> {
    const client = tx ?? this.db;
    const updated = await client.group.update({
      where: { id: group.id },
      data: {
        name: group.name,
        avatar: group.avatar,
        note: group.note,
        settleSchedule: group.settleSchedule ?? undefined,
        nextSettleAt: group.nextSettleAt,
        isArchived: group.isArchived,
      },
      include: { members: true },
    });
    return this.mapGroup(updated);
  }

  async softDelete(groupId: string, tx?: TransactionClient): Promise<void> {
    const client = tx ?? this.db;
    await client.group.update({
      where: { id: groupId },
      data: { deletedAt: new Date() },
    });
  }

  async archive(
    groupId: string,
    isArchived: boolean,
    tx?: TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.db;
    await client.group.update({ where: { id: groupId }, data: { isArchived } });
  }

  async addMembers(
    groupId: string,
    userIds: string[],
    tx?: TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.db;
    for (const userId of userIds) {
      const existing = await client.groupMember.findUnique({
        where: { groupId_userId: { groupId, userId } },
      });
      if (existing) {
        await client.groupMember.update({
          where: { id: existing.id },
          data: { leftAt: null, joinedAt: new Date() },
        });
      } else {
        await client.groupMember.create({
          data: { groupId, userId },
        });
      }
    }
  }

  async removeMember(groupId: string, userId: string, tx?: TransactionClient): Promise<void> {
    const client = tx ?? this.db;
    await client.groupMember.update({
      where: { groupId_userId: { groupId, userId } },
      data: { leftAt: new Date() },
    });
  }

  async setMemberAdmin(
    groupId: string,
    userId: string,
    isAdmin: boolean,
    tx?: TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.db;
    await client.groupMember.update({
      where: { groupId_userId: { groupId, userId } },
      data: { isAdmin },
    });
  }

  async getActiveAdminCount(groupId: string, tx?: TransactionClient): Promise<number> {
    const client = tx ?? this.db;
    return client.groupMember.count({
      where: { groupId, isAdmin: true, leftAt: null },
    });
  }

  async findMember(groupId: string, userId: string): Promise<GroupMember | null> {
    const row = await this.db.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    return row ? this.mapMember(row) : null;
  }
}

export const groupRepository = new GroupRepository(prisma);
