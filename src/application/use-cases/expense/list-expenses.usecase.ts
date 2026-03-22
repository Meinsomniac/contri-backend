import { IExpenseRepository } from "@application/interfaces/repositories/expense.interface";
import { expenseRepository } from "@infrastructure/database/repositories/expense.repository";
import { ExpenseFilters, Pagination } from "@shared/types/expense.types";

export class ListExpensesUseCase {
  constructor(private repo: IExpenseRepository) {}

  async execute(
    groupId: string | null,
    actorId: string,
    filters: ExpenseFilters,
    pagination: Pagination,
  ) {
    return this.repo.listByGroup(groupId, actorId, filters, pagination);
  }
}

export const listExpensesUseCase = new ListExpensesUseCase(expenseRepository);
