import { IExpenseRepository } from "@application/interfaces/repositories/expense.interface";
import { IGroupRepository } from "@application/interfaces/repositories/group.interface";
import { IBalanceRepository } from "@application/interfaces/repositories/balance.interface";
import { Expense } from "@domain/entities/expense.entity";
import prisma from "@infrastructure/database/prisma/prisma";
import { balanceRepository } from "@infrastructure/database/repositories/balance.repository";
import { expenseRepository } from "@infrastructure/database/repositories/expense.repository";
import { groupRepository } from "@infrastructure/database/repositories/group.repository";
import {
  ExpensePayerInput,
  ExpenseSplitInput,
  SplitMethod,
} from "@shared/types/expense.types";
import { computeBalanceDeltas } from "@shared/utils/balance-delta.util";
import { AppError } from "@shared/error/AppError";
import CloudinaryService from "@infrastructure/services/cloudinary.service";

type Input = {
  groupPublicId?: string;
  actorId: string;
  title: string;
  totalAmount: number;
  currency: string;
  category?: string;
  receiptUrl?: Buffer;
  notes?: string;
  expenseDate?: Date;
  splitMethod: SplitMethod;
  idempotencyKey?: string;
  payers: ExpensePayerInput[];
  splits: ExpenseSplitInput[];
};

export class CreateExpenseUseCase {
  constructor(
    private groupRepo: IGroupRepository,
    private expenseRepo: IExpenseRepository,
    private balanceRepo: IBalanceRepository,
  ) {}

  async execute(input: Input) {
    if (input.idempotencyKey) {
      const existing = await this.expenseRepo.findByIdempotencyKey(input.idempotencyKey);
      if (existing) return existing;
    }

    let groupId: string | null = null;
    if (input.groupPublicId) {
      const group = await this.groupRepo.findByPublicId(input.groupPublicId);
      if (!group) throw new AppError("Group not found", 404);
      groupId = group.id;
    } else {
      const participants = new Set<string>([
        ...input.payers.map((payer) => payer.userId),
        ...input.splits.map((split) => split.userId),
      ]);
      participants.delete(input.actorId);

      for (const participantId of participants) {
        const relationCount = await prisma.friendShip.count({
          where: {
            status: "ACTIVE",
            OR: [
              { userId: input.actorId, friendId: participantId },
              { userId: participantId, friendId: input.actorId },
            ],
          },
        });
        if (!relationCount) {
          throw new AppError(
            "All non-group expense participants must be friends with the actor",
            400,
          );
        }
      }
    }

    Expense.validatePayers(input.payers, input.totalAmount);
    Expense.validateSplits(input.splits, input.totalAmount, input.splitMethod);
    const resolvedSplits = Expense.resolveComputedAmounts(
      input.splits,
      input.totalAmount,
      input.splitMethod,
    );

    let receipt: string | null = null;
    if (input.receiptUrl) {
      const result = await CloudinaryService.uploadStream(
        input.receiptUrl,
        "expenses/receipts",
      );
      receipt = result.url;
    }

    return prisma.$transaction(async (tx) => {
      const created = await this.expenseRepo.create(
        new Expense(
          "",
          input.title,
          input.totalAmount,
          input.currency,
          groupId,
          input.actorId,
          {
            category: input.category ?? null,
            receiptUrl: receipt ?? null,
            notes: input.notes ?? null,
            expenseDate: input.expenseDate,
            idempotencyKey: input.idempotencyKey ?? null,
          },
        ),
        input.payers,
        resolvedSplits.map((split) => ({
          userId: split.userId,
          splitMethod: input.splitMethod,
          rawValue: split.rawValue,
          computedAmount: split.computedAmount ?? 0,
        })),
        tx,
      );

      const deltas = computeBalanceDeltas(input.payers, resolvedSplits);
      for (const delta of deltas) {
        await this.balanceRepo.upsertPair(
          delta.userAId,
          delta.userBId,
          groupId,
          input.currency,
          delta.delta,
          tx,
        );
      }
      return created;
    });
  }
}

export const createExpenseUseCase = new CreateExpenseUseCase(
  groupRepository,
  expenseRepository,
  balanceRepository,
);
