import { ErrorMessages } from '../constants/errors-messages.constant';
import { SQLErrorsCodes } from '../enums/sql-errors-codes.enum';

export const normalizeSQLError = (
  message: string,
  code?: string,
): { status: number; message: typeof ErrorMessages | string } => {
  if (!code) {
    return { status: 500, message: ErrorMessages.INTERNAL_SERVER_ERROR };
  }

  switch (code) {
    case SQLErrorsCodes.DUPLICATE: {
      return { status: 409, message };
    }
  }
};
