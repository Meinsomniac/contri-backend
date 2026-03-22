import { nanoid } from "@shared/functions";
import { AppError } from "@shared/error/AppError";
import {
  ExpensePayerInput,
  ExpenseSplitInput,
  SplitMethod,
} from "@shared/types/expense.types";
import { resolveSplitComputedAmounts } from "@shared/utils/split-resolver.util";

export class Expense {
  constructor(
    public readonly id: string,
    public title: string,
    public totalAmount: number,
    public currency: string,
    public groupId: string | null,
    public createdBy: string,
    public options?: {
      publicId?: string;
      category?: string | null;
      receiptUrl?: string | null;
      notes?: string | null;
      expenseDate?: Date;
      status?: "ACTIVE" | "DELETED" | "SETTLED";
      idempotencyKey?: string | null;
      deletedAt?: Date | null;
      deletedBy?: string | null;
    },
  ) {}

  get publicId(): string {
    return this.options?.publicId ?? `exp_${nanoid()}`;
  }

  static resolveComputedAmounts(
    splits: ExpenseSplitInput[],
    totalAmount: number,
    splitMethod: SplitMethod,
  ): ExpenseSplitInput[] {
    return resolveSplitComputedAmounts(splits, totalAmount, splitMethod);
  }

  static validatePayers(payers: ExpensePayerInput[], totalAmount: number): void {
    const paid = payers.reduce((acc, item) => acc + item.amountPaid, 0);
    if (Math.abs(paid - totalAmount) > 0.01) {
      throw new AppError("Payer amounts must equal total amount", 400);
    }
  }

  static validateSplits(
    splits: ExpenseSplitInput[],
    totalAmount: number,
    splitMethod: SplitMethod,
  ): void {
    if (!splits.length) throw new AppError("At least one split is required", 400);
    const sumRaw = splits.reduce((acc, item) => acc + item.rawValue, 0);
    if (splitMethod === "EXACT" && Math.abs(sumRaw - totalAmount) > 0.01) {
      throw new AppError("Exact splits must equal total amount", 400);
    }
    if (splitMethod === "PERCENTAGE" && Math.abs(sumRaw - 100) > 0.01) {
      throw new AppError("Percentage splits must total 100", 400);
    }
    if (
      splitMethod === "SHARES" &&
      !splits.every((split) => Number.isInteger(split.rawValue) && split.rawValue > 0)
    ) {
      throw new AppError("Shares must be positive integers", 400);
    }
  }
}
