import z from "zod";

const payerSchema = z.object({
  userId: z.string().min(1),
  amountPaid: z.coerce.number().positive(),
});

const splitSchema = z.object({
  userId: z.string().min(1),
  rawValue: z.coerce.number().nonnegative(),
});

const expenseBase = z.object({
  title: z.string().min(1),
  totalAmount: z.coerce.number().positive(),
  currency: z.string().min(3).max(3),
  category: z.string().optional(),
  receiptUrl: z.string().optional(),
  notes: z.string().optional(),
  expenseDate: z.coerce.date().optional(),
  splitMethod: z.enum(["EQUAL", "EXACT", "PERCENTAGE", "SHARES"]),
  idempotencyKey: z.string().optional(),
  payers: z.array(payerSchema).min(1),
  splits: z.array(splitSchema).min(1),
});

export const createExpenseSchema = z.object({
  body: expenseBase,
});

export const updateExpenseSchema = z.object({
  body: expenseBase,
});

export const addCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(500),
  }),
});

export const editCommentSchema = addCommentSchema;

export const listExpensesQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    category: z.string().optional(),
    status: z.enum(["ACTIVE", "DELETED", "SETTLED"]).optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  }),
});
