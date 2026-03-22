import { IExpenseRepository } from "@application/interfaces/repositories/expense.interface";
import { expenseRepository } from "@infrastructure/database/repositories/expense.repository";
import { AppError } from "@shared/error/AppError";

export class EditCommentUseCase {
  constructor(private repo: IExpenseRepository) {}

  async execute(commentId: string, actorId: string, content: string) {
    const comment = await this.repo.findCommentById(commentId);
    if (!comment || comment.deletedAt) throw new AppError("Comment not found", 404);
    if (comment.userId !== actorId) throw new AppError("Forbidden comment edit", 403);
    return this.repo.updateComment(commentId, content);
  }
}

export const editCommentUseCase = new EditCommentUseCase(expenseRepository);
