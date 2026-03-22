export type SplitMethod = "EQUAL" | "EXACT" | "PERCENTAGE" | "SHARES";

export type Pagination = {
  page: number;
  limit: number;
};

export type ExpenseFilters = {
  category?: string;
  status?: "ACTIVE" | "DELETED" | "SETTLED";
  from?: Date;
  to?: Date;
};

export type ExpensePayerInput = {
  userId: string;
  amountPaid: number;
};

export type ExpenseSplitInput = {
  userId: string;
  rawValue: number;
  computedAmount?: number;
};

export type BalanceDelta = {
  userAId: string;
  userBId: string;
  delta: number;
};
