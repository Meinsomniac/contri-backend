import { AppError } from "@shared/error/AppError";
import { ExpenseSplitInput, SplitMethod } from "@shared/types/expense.types";

const round2 = (value: number): number => Number(value.toFixed(2));

export const resolveSplitComputedAmounts = (
  splits: ExpenseSplitInput[],
  totalAmount: number,
  splitMethod: SplitMethod,
): ExpenseSplitInput[] => {
  if (!splits.length) throw new AppError("At least one split is required", 400);
  const computed: ExpenseSplitInput[] = splits.map((split) => ({ ...split }));

  if (splitMethod === "EQUAL") {
    const base = round2(totalAmount / computed.length);
    computed.forEach((split) => {
      split.computedAmount = base;
    });
  } else if (splitMethod === "EXACT") {
    computed.forEach((split) => {
      split.computedAmount = round2(split.rawValue);
    });
  } else if (splitMethod === "PERCENTAGE") {
    computed.forEach((split) => {
      split.computedAmount = round2((split.rawValue / 100) * totalAmount);
    });
  } else if (splitMethod === "SHARES") {
    const totalShares = computed.reduce((sum, split) => sum + split.rawValue, 0);
    if (totalShares <= 0) throw new AppError("Invalid shares split values", 400);
    computed.forEach((split) => {
      split.computedAmount = round2((split.rawValue / totalShares) * totalAmount);
    });
  } else {
    throw new AppError("Unsupported split method", 400);
  }

  // Assign rounding remainder to largest rawValue
  const resolvedTotal = computed.reduce(
    (sum, split) => sum + (split.computedAmount ?? 0),
    0,
  );
  const remainder = round2(totalAmount - resolvedTotal);
  if (Math.abs(remainder) > 0) {
    const maxIndex = computed.reduce((bestIdx, current, idx, arr) =>
      current.rawValue > arr[bestIdx].rawValue ? idx : bestIdx,
    0);
    computed[maxIndex].computedAmount = round2(
      (computed[maxIndex].computedAmount ?? 0) + remainder,
    );
  }

  return computed;
};
