import { IExpenseRepository } from "@application/interfaces/repositories/expense.interface";
import { expenseRepository } from "@infrastructure/database/repositories/expense.repository";
import { AppError } from "@shared/error/AppError";

export class GetExpenseUseCase {
  constructor(private repo: IExpenseRepository) {}

  async execute(publicId: string) {
    const expense = await this.repo.findByPublicId(publicId);
    if (!expense) throw new AppError("Expense not found", 404);
    return expense;
  }
}

export const getExpenseUseCase = new GetExpenseUseCase(expenseRepository);
