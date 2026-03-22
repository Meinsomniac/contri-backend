import {
  ExpenseCommentRow,
  ExpensePayerRow,
  ExpenseSplitRow,
  IExpenseRepository,
} from "@application/interfaces/repositories/expense.interface";
import { Expense } from "@domain/entities/expense.entity";
import { PrismaClient } from "@infrastructure/database/generated/prisma/client";
import { TransactionClient } from "@infrastructure/database/generated/prisma/internal/prismaNamespace";
import prisma from "@infrastructure/database/prisma/prisma";
import { ExpenseFilters, Pagination } from "@shared/types/expense.types";

class ExpenseRepository implements IExpenseRepository {
  constructor(private db: PrismaClient) {}

  private mapExpense(row: any): Expense {
    return new Expense(
      row.id,
      row.title,
      Number(row.totalAmount),
      row.currency,
      row.groupId,
      row.createdBy,
      {
        publicId: row.publicId,
        category: row.category,
        receiptUrl: row.receiptUrl,
        notes: row.notes,
        expenseDate: row.expenseDate,
        status: row.status,
        idempotencyKey: row.idempotencyKey,
        deletedAt: row.deletedAt,
        deletedBy: row.deletedBy,
      },
    );
  }

  async create(
    expense: Expense,
    payers: ExpensePayerRow[],
    splits: ExpenseSplitRow[],
    tx?: TransactionClient,
  ): Promise<Expense> {
    const client = tx ?? this.db;
    const created = await client.expense.create({
      data: {
        publicId: expense.publicId,
        title: expense.title,
        totalAmount: expense.totalAmount,
        currency: expense.currency,
        category: expense.options?.category,
        receiptUrl: expense.options?.receiptUrl,
        notes: expense.options?.notes,
        expenseDate: expense.options?.expenseDate,
        groupId: expense.groupId,
        createdBy: expense.createdBy,
        idempotencyKey: expense.options?.idempotencyKey ?? undefined,
        payers: {
          create: payers.map((payer) => ({
            userId: payer.userId,
            amountPaid: payer.amountPaid,
          })),
        },
        splits: {
          create: splits.map((split) => ({
            userId: split.userId,
            splitMethod: split.splitMethod,
            rawValue: split.rawValue,
            computedAmount: split.computedAmount,
          })),
        },
      },
    });
    return this.mapExpense(created);
  }

  async findByPublicId(publicId: string): Promise<Expense | null> {
    const row = await this.db.expense.findFirst({
      where: { publicId, deletedAt: null },
    });
    return row ? this.mapExpense(row) : null;
  }

  async findByIdempotencyKey(key: string): Promise<Expense | null> {
    const row = await this.db.expense.findFirst({
      where: { idempotencyKey: key, deletedAt: null },
    });
    return row ? this.mapExpense(row) : null;
  }

  async listByGroup(
    groupId: string | null,
    actorId: string,
    filters: ExpenseFilters,
    pagination: Pagination,
  ): Promise<Expense[]> {
    const rows = await this.db.expense.findMany({
      where: {
        groupId,
        deletedAt: null,
        ...(groupId === null && { createdBy: actorId }),
        ...(filters.category && { category: filters.category }),
        ...(filters.status && { status: filters.status }),
        ...(filters.from || filters.to
          ? {
              expenseDate: {
                ...(filters.from && { gte: filters.from }),
                ...(filters.to && { lte: filters.to }),
              },
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });
    return rows.map((row) => this.mapExpense(row));
  }

  async update(
    expense: Expense,
    payers: ExpensePayerRow[],
    splits: ExpenseSplitRow[],
    tx?: TransactionClient,
  ): Promise<Expense> {
    const client = tx ?? this.db;
    await client.expensePayer.deleteMany({ where: { expenseId: expense.id } });
    await client.expenseSplit.deleteMany({ where: { expenseId: expense.id } });
    const updated = await client.expense.update({
      where: { id: expense.id },
      data: {
        title: expense.title,
        totalAmount: expense.totalAmount,
        currency: expense.currency,
        category: expense.options?.category,
        receiptUrl: expense.options?.receiptUrl,
        notes: expense.options?.notes,
        expenseDate: expense.options?.expenseDate,
        payers: {
          create: payers.map((payer) => ({
            userId: payer.userId,
            amountPaid: payer.amountPaid,
          })),
        },
        splits: {
          create: splits.map((split) => ({
            userId: split.userId,
            splitMethod: split.splitMethod,
            rawValue: split.rawValue,
            computedAmount: split.computedAmount,
          })),
        },
      },
    });
    return this.mapExpense(updated);
  }

  async softDelete(
    expenseId: string,
    deletedBy: string,
    tx?: TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.db;
    await client.expense.update({
      where: { id: expenseId },
      data: { status: "DELETED", deletedAt: new Date(), deletedBy },
    });
  }

  async addComment(
    comment: ExpenseCommentRow,
    tx?: TransactionClient,
  ): Promise<ExpenseCommentRow> {
    const client = tx ?? this.db;
    const row = await client.expenseComment.create({
      data: {
        expenseId: comment.expenseId,
        userId: comment.userId,
        content: comment.content,
      },
    });
    return row;
  }

  async updateComment(commentId: string, content: string): Promise<ExpenseCommentRow> {
    const row = await this.db.expenseComment.update({
      where: { id: commentId },
      data: { content },
    });
    return row;
  }

  async softDeleteComment(commentId: string, tx?: TransactionClient): Promise<void> {
    const client = tx ?? this.db;
    await client.expenseComment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });
  }

  async findCommentById(commentId: string): Promise<ExpenseCommentRow | null> {
    return this.db.expenseComment.findUnique({ where: { id: commentId } });
  }
}

export const expenseRepository = new ExpenseRepository(prisma);
