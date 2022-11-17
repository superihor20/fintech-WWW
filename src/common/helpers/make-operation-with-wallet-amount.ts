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
      break;
    case OperationType.WITHDRAW:
      updatedAmount = amount - operationAmountOrPercent;
      break;
    case OperationType.DAILY_INCREASE:
      updatedAmount = amount + amount * (operationAmountOrPercent / 100);
      break;
  }

  const earnings = getEarnings(amount, updatedAmount);

  return {
    updatedAmount,
    earnings,
  };
};
