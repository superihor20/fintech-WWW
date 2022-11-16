export const ErrorMessages = {
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  USER_NOT_FOUND: 'User not found',
  NOT_ENOUGH_MONEY: 'You have not enough money to make a withdraw',
  NOT_ENOUGH_MONEY_TO_STEAL: (amount: number, total: number): string =>
    `You can't steal ${amount}, you can steal only ${total}`,
  INVITER_CODE_IS_NOT_VALID: 'Code is not valid',
} as const;
