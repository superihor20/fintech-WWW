import { OperationType } from '../enums/operation-type.enum';

export const makeOperationWithWalletAmount = (
  totalAmount: number,
  amount: number,
  type: OperationType,
): number => {
  switch (type) {
    case OperationType.DEPOSITE:
      return totalAmount + amount;
    case OperationType.WITHDRAW:
      return totalAmount - amount;
  }
};
