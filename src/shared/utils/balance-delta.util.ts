import {
  BalanceDelta,
  ExpensePayerInput,
  ExpenseSplitInput,
} from "@shared/types/expense.types";

export const computeBalanceDeltas = (
  payers: ExpensePayerInput[],
  splits: ExpenseSplitInput[],
): BalanceDelta[] => {
  const netByUser = new Map<string, number>();

  for (const payer of payers) {
    netByUser.set(payer.userId, (netByUser.get(payer.userId) ?? 0) + payer.amountPaid);
  }
  for (const split of splits) {
    netByUser.set(
      split.userId,
      (netByUser.get(split.userId) ?? 0) - (split.computedAmount ?? 0),
    );
  }

  const creditors = [...netByUser.entries()]
    .filter(([, amount]) => amount > 0)
    .map(([userId, amount]) => ({ userId, amount }));
  const debtors = [...netByUser.entries()]
    .filter(([, amount]) => amount < 0)
    .map(([userId, amount]) => ({ userId, amount: Math.abs(amount) }));

  const deltas: BalanceDelta[] = [];
  let c = 0;
  let d = 0;
  while (c < creditors.length && d < debtors.length) {
    const paid = Math.min(creditors[c].amount, debtors[d].amount);
    const userAId =
      debtors[d].userId < creditors[c].userId ? debtors[d].userId : creditors[c].userId;
    const userBId =
      debtors[d].userId < creditors[c].userId ? creditors[c].userId : debtors[d].userId;
    const delta = debtors[d].userId < creditors[c].userId ? paid : -paid;
    deltas.push({ userAId, userBId, delta: Number(paid.toFixed(2)) * Math.sign(delta) });

    creditors[c].amount -= paid;
    debtors[d].amount -= paid;
    if (creditors[c].amount <= 0.0001) c++;
    if (debtors[d].amount <= 0.0001) d++;
  }

  return deltas;
};
