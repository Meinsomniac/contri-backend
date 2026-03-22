import { addCommentUseCase } from "@application/use-cases/expense/add-comment.usecase";
import { createExpenseUseCase } from "@application/use-cases/expense/create-expense.usecase";
import { deleteCommentUseCase } from "@application/use-cases/expense/delete-comment.usecase";
import { deleteExpenseUseCase } from "@application/use-cases/expense/delete-expense.usecase";
import { editCommentUseCase } from "@application/use-cases/expense/edit-comment.usecase";
import { getExpenseUseCase } from "@application/use-cases/expense/get-expense.usecase";
import { listExpensesUseCase } from "@application/use-cases/expense/list-expenses.usecase";
import { updateExpenseUseCase } from "@application/use-cases/expense/update-expense.usecase";
import { Request, Response } from "express";

export class ExpenseController {
  static async createExpense(req: Request, res: Response) {
    const receiptBuffer = req.file?.buffer;
    const data = await createExpenseUseCase.execute({
      groupPublicId: req.params.publicId,
      actorId: req.user!.id,
      receiptUrl: receiptBuffer ?? undefined,
      ...req.body,
    });
    res.status(201).json({ success: true, data });
  }

  static async listExpenses(req: Request, res: Response) {
    const data = await listExpensesUseCase.execute(
      req.group?.id ?? null,
      req.user!.id,
      {
        category: req.query.category as string | undefined,
        status: req.query.status as "ACTIVE" | "DELETED" | "SETTLED" | undefined,
        from: req.query.from ? new Date(req.query.from as string) : undefined,
        to: req.query.to ? new Date(req.query.to as string) : undefined,
      },
      {
        page: Number(req.query.page ?? 1),
        limit: Number(req.query.limit ?? 20),
      },
    );
    res.status(200).json({ success: true, data });
  }

  static async getExpense(req: Request, res: Response) {
    const data = await getExpenseUseCase.execute(req.params.expenseId);
    res.status(200).json({ success: true, data });
  }

  static async updateExpense(req: Request, res: Response) {
    const data = await updateExpenseUseCase.execute({
      expensePublicId: req.params.expenseId,
      actorId: req.user!.id,
      ...req.body,
    });
    res.status(200).json({ success: true, data });
  }

  static async deleteExpense(req: Request, res: Response) {
    await deleteExpenseUseCase.execute(req.params.expenseId, req.user!.id);
    res.status(200).json({ success: true, message: "Expense deleted successfully" });
  }

  static async addComment(req: Request, res: Response) {
    const data = await addCommentUseCase.execute(
      req.params.expenseId,
      req.user!.id,
      req.body.content,
    );
    res.status(201).json({ success: true, data });
  }

  static async editComment(req: Request, res: Response) {
    const data = await editCommentUseCase.execute(
      req.params.id,
      req.user!.id,
      req.body.content,
    );
    res.status(200).json({ success: true, data });
  }

  static async deleteComment(req: Request, res: Response) {
    await deleteCommentUseCase.execute(req.params.id, req.user!.id, req.params.publicId);
    res.status(200).json({ success: true, message: "Comment deleted successfully" });
  }
}
