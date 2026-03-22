import { IExpenseRepository } from "@application/interfaces/repositories/expense.interface";
import { expenseRepository } from "@infrastructure/database/repositories/expense.repository";
import { AppError } from "@shared/error/AppError";

export class DeleteExpenseUseCase {
  constructor(private repo: IExpenseRepository) {}

  async execute(expensePublicId: string, actorId: string) {
    const expense = await this.repo.findByPublicId(expensePublicId);
    if (!expense) throw new AppError("Expense not found", 404);
    await this.repo.softDelete(expense.id, actorId);
  }
}

export const deleteExpenseUseCase = new DeleteExpenseUseCase(expenseRepository);
