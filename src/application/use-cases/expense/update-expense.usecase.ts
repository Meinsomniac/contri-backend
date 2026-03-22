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

type Input = {
  expensePublicId: string;
  actorId: string;
  title: string;
  totalAmount: number;
  currency: string;
  splitMethod: SplitMethod;
  payers: ExpensePayerInput[];
  splits: ExpenseSplitInput[];
  category?: string;
  receiptUrl?: string;
  notes?: string;
  expenseDate?: Date;
};

export class UpdateExpenseUseCase {
  constructor(
    private groupRepo: IGroupRepository,
    private expenseRepo: IExpenseRepository,
    private balanceRepo: IBalanceRepository,
  ) {}

  async execute(input: Input) {
    const current = await this.expenseRepo.findByPublicId(input.expensePublicId);
    if (!current) throw new AppError("Expense not found", 404);

    Expense.validatePayers(input.payers, input.totalAmount);
    Expense.validateSplits(input.splits, input.totalAmount, input.splitMethod);
    const resolvedSplits = Expense.resolveComputedAmounts(
      input.splits,
      input.totalAmount,
      input.splitMethod,
    );

    return prisma.$transaction(async (tx) => {
      // Simplified update path: applies only new deltas.
      const updated = await this.expenseRepo.update(
        new Expense(
          current.id,
          input.title,
          input.totalAmount,
          input.currency,
          current.groupId,
          current.createdBy,
          {
            publicId: current.publicId,
            category: input.category ?? null,
            receiptUrl: input.receiptUrl ?? null,
            notes: input.notes ?? null,
            expenseDate: input.expenseDate,
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
          current.groupId,
          input.currency,
          delta.delta,
          tx,
        );
      }
      return updated;
    });
  }
}

export const updateExpenseUseCase = new UpdateExpenseUseCase(
  groupRepository,
  expenseRepository,
  balanceRepository,
);
