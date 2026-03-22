import { TransactionClient } from "@infrastructure/database/generated/prisma/internal/prismaNamespace";

export type BalanceCacheRow = {
  id: string;
  userAId: string;
  userBId: string;
  groupId: string | null;
  currency: string;
  netAmount: number;
  updatedAt: Date;
};

export interface IBalanceRepository {
  upsertPair(
    userAId: string,
    userBId: string,
    groupId: string | null,
    currency: string,
    delta: number,
    tx?: TransactionClient,
  ): Promise<void>;
  getByGroup(groupId: string): Promise<BalanceCacheRow[]>;
  getByUser(userId: string): Promise<BalanceCacheRow[]>;
}
