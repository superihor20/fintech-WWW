import { OperationTypes } from '../enums/operation-types.enum';

const getEarnings = (prevAmount: number, amount: number): number => {
  return (prevAmount - amount) * -1;
};

export const makeOperationWithWalletAmount = (
  amount: number,
  operationAmountOrPercent: number,
  type: OperationTypes,
): { updatedAmount: number; earnings: number } => {
  let updatedAmount: number;

  switch (type) {
    case OperationTypes.DEPOSITE:
      updatedAmount = amount + operationAmountOrPercent;
      break;
    case OperationTypes.WITHDRAW:
      updatedAmount = amount - operationAmountOrPercent;
      break;
    case OperationTypes.DAILY_INCREASE:
      updatedAmount = amount + amount * (operationAmountOrPercent / 100);
      break;
  }

  const earnings = getEarnings(amount, updatedAmount);

  return {
    updatedAmount,
    earnings,
  };
};
