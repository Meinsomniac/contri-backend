import {
  BalanceCacheRow,
  IBalanceRepository,
} from "@application/interfaces/repositories/balance.interface";
import { PrismaClient } from "@infrastructure/database/generated/prisma/client";
import { TransactionClient } from "@infrastructure/database/generated/prisma/internal/prismaNamespace";
import prisma from "@infrastructure/database/prisma/prisma";

class BalanceRepository implements IBalanceRepository {
  constructor(private db: PrismaClient) {}

  async upsertPair(
    userAId: string,
    userBId: string,
    groupId: string | null,
    currency: string,
    delta: number,
    tx?: TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.db;
    let a = userAId;
    let b = userBId;
    let signedDelta = delta;
    if (a > b) {
      a = userBId;
      b = userAId;
      signedDelta = -delta;
    }

    const targets = [groupId, null];
    for (const targetGroupId of targets) {
      const existing = await client.balanceCache.findFirst({
        where: {
          userAId: a,
          userBId: b,
          groupId: targetGroupId,
          currency,
        },
      });
      if (existing) {
        await client.balanceCache.update({
          where: { id: existing.id },
          data: { netAmount: { increment: signedDelta } },
        });
      } else {
        await client.balanceCache.create({
          data: {
            userAId: a,
            userBId: b,
            groupId: targetGroupId,
            currency,
            netAmount: signedDelta,
          },
        });
      }
    }
  }

  private map(rows: any[]): BalanceCacheRow[] {
    return rows.map((row) => ({
      id: row.id,
      userAId: row.userAId,
      userBId: row.userBId,
      groupId: row.groupId,
      currency: row.currency,
      netAmount: Number(row.netAmount),
      updatedAt: row.updatedAt,
    }));
  }

  async getByGroup(groupId: string): Promise<BalanceCacheRow[]> {
    const rows = await this.db.balanceCache.findMany({
      where: { groupId },
      orderBy: { updatedAt: "desc" },
    });
    return this.map(rows);
  }

  async getByUser(userId: string): Promise<BalanceCacheRow[]> {
    const rows = await this.db.balanceCache.findMany({
      where: { OR: [{ userAId: userId }, { userBId: userId }] },
      orderBy: { updatedAt: "desc" },
    });
    return this.map(rows);
  }
}

export const balanceRepository = new BalanceRepository(prisma);
