import { IExpenseRepository } from "@application/interfaces/repositories/expense.interface";
import { IGroupRepository } from "@application/interfaces/repositories/group.interface";
import { expenseRepository } from "@infrastructure/database/repositories/expense.repository";
import { groupRepository } from "@infrastructure/database/repositories/group.repository";
import { AppError } from "@shared/error/AppError";

export class DeleteCommentUseCase {
  constructor(
    private repo: IExpenseRepository,
    private groupRepo: IGroupRepository,
  ) {}

  async execute(commentId: string, actorId: string, groupPublicId?: string) {
    const comment = await this.repo.findCommentById(commentId);
    if (!comment || comment.deletedAt) throw new AppError("Comment not found", 404);

    if (groupPublicId) {
      const group = await this.groupRepo.findByPublicId(groupPublicId);
      if (!group) throw new AppError("Group not found", 404);
      const membership = await this.groupRepo.findMember(group.id, actorId);
      const isAdmin = !!membership && membership.leftAt === null && membership.isAdmin;
      if (comment.userId !== actorId && !isAdmin) {
        throw new AppError("Forbidden comment delete", 403);
      }
    } else if (comment.userId !== actorId) {
      throw new AppError("Forbidden comment delete", 403);
    }
    await this.repo.softDeleteComment(commentId);
  }
}

export const deleteCommentUseCase = new DeleteCommentUseCase(
  expenseRepository,
  groupRepository,
);
