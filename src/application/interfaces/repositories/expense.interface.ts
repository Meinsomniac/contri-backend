import { Expense } from "@domain/entities/expense.entity";
import { ExpenseFilters, Pagination } from "@shared/types/expense.types";
import { TransactionClient } from "@infrastructure/database/generated/prisma/internal/prismaNamespace";

export type ExpensePayerRow = {
  userId: string;
  amountPaid: number;
};

export type ExpenseSplitRow = {
  userId: string;
  splitMethod: "EQUAL" | "EXACT" | "PERCENTAGE" | "SHARES";
  rawValue: number;
  computedAmount: number;
};

export type ExpenseCommentRow = {
  id: string;
  expenseId: string;
  userId: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

export interface IExpenseRepository {
  create(
    expense: Expense,
    payers: ExpensePayerRow[],
    splits: ExpenseSplitRow[],
    tx?: TransactionClient,
  ): Promise<Expense>;
  findByPublicId(publicId: string): Promise<Expense | null>;
  findByIdempotencyKey(key: string): Promise<Expense | null>;
  listByGroup(
    groupId: string | null,
    actorId: string,
    filters: ExpenseFilters,
    pagination: Pagination,
  ): Promise<Expense[]>;
  update(
    expense: Expense,
    payers: ExpensePayerRow[],
    splits: ExpenseSplitRow[],
    tx?: TransactionClient,
  ): Promise<Expense>;
  softDelete(expenseId: string, deletedBy: string, tx?: TransactionClient): Promise<void>;

  addComment(comment: ExpenseCommentRow, tx?: TransactionClient): Promise<ExpenseCommentRow>;
  updateComment(commentId: string, content: string): Promise<ExpenseCommentRow>;
  softDeleteComment(commentId: string, tx?: TransactionClient): Promise<void>;
  findCommentById(commentId: string): Promise<ExpenseCommentRow | null>;
}
