import { ExpenseController } from "@presentation/controllers/expense.controller";
import { authenticate } from "@infrastructure/middleware/authenticate";
import { requireMember } from "@infrastructure/middleware/group-auth.middleware";
import { validator } from "@infrastructure/middleware/validator";
import {
  addCommentSchema,
  createExpenseSchema,
  editCommentSchema,
  listExpensesQuerySchema,
  updateExpenseSchema,
} from "@presentation/validators/expense.validator";
import { Router } from "express";
import { uploadSingle } from "@infrastructure/middleware/upload";

const ExpenseRouter: Router = Router();

// Personal/friend-based expenses (without group)
ExpenseRouter.post("/", authenticate, uploadSingle("receiptUrl"), validator(createExpenseSchema), ExpenseController.createExpense);
ExpenseRouter.get("/", authenticate, validator(listExpensesQuerySchema), ExpenseController.listExpenses);

// Group-scoped expenses
ExpenseRouter.post(
  "/group/:publicId",
  authenticate,
  requireMember,
  uploadSingle("receiptUrl"),
  validator(createExpenseSchema),
  ExpenseController.createExpense,
);
ExpenseRouter.get(
  "/group/:publicId",
  authenticate,
  requireMember,
  validator(listExpensesQuerySchema),
  ExpenseController.listExpenses,
);

// Shared expense operations
ExpenseRouter.get("/:expenseId", authenticate, ExpenseController.getExpense);
ExpenseRouter.patch(
  "/:expenseId",
  authenticate,
  uploadSingle("receiptUrl"),
  validator(updateExpenseSchema),
  ExpenseController.updateExpense,
);
ExpenseRouter.delete("/:expenseId", authenticate, ExpenseController.deleteExpense);

ExpenseRouter.post(
  "/:expenseId/comments",
  authenticate,
  validator(addCommentSchema),
  ExpenseController.addComment,
);
ExpenseRouter.patch(
  "/:expenseId/comments/:id",
  authenticate,
  validator(editCommentSchema),
  ExpenseController.editComment,
);
ExpenseRouter.delete("/:expenseId/comments/:id", authenticate, ExpenseController.deleteComment);

export default ExpenseRouter;
