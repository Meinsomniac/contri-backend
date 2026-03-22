import {
  ExpenseCommentRow,
  IExpenseRepository,
} from "@application/interfaces/repositories/expense.interface";
import { expenseRepository } from "@infrastructure/database/repositories/expense.repository";
import { AppError } from "@shared/error/AppError";

export class AddCommentUseCase {
  constructor(private repo: IExpenseRepository) {}

  async execute(expensePublicId: string, userId: string, content: string) {
    const expense = await this.repo.findByPublicId(expensePublicId);
    if (!expense) throw new AppError("Expense not found", 404);
    const payload: ExpenseCommentRow = {
      id: "",
      expenseId: expense.id,
      userId,
      content,
    };
    return this.repo.addComment(payload);
  }
}

export const addCommentUseCase = new AddCommentUseCase(expenseRepository);
