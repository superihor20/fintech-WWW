import { OperationType } from '../enums/operation-type.enum';

const getEarnings = (prevAmount: number, amount: number): number => {
  return (prevAmount - amount) * -1;
};

export const makeOperationWithWalletAmount = (
  amount: number,
  operationAmountOrPercent: number,
  type: OperationType,
): { updatedAmount: number; earnings: number } => {
  let updatedAmount: number;

  switch (type) {
    case OperationType.DEPOSITE:
      updatedAmount = amount + operationAmountOrPercent;
    case OperationType.WITHDRAW:
      updatedAmount = amount - operationAmountOrPercent;
    case OperationType.DAILY_INCREASE:
      updatedAmount = amount + amount * (operationAmountOrPercent / 100);
  }

  const earnings = getEarnings(amount, updatedAmount);

  return {
    updatedAmount,
    earnings,
  };
};
