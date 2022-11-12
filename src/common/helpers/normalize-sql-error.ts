import { ErrorMessagesEnums } from '../enums/errors-messages.enum';
import { SQLErrorsCodes } from '../enums/sql-errors-codes';

export const normalizeSQLError = (
  message: string,
  code?: string,
): { status: number; message: ErrorMessagesEnums | string } => {
  if (!code) {
    return { status: 500, message: ErrorMessagesEnums.INTERNAL_SERVER_ERROR };
  }

  switch (code) {
    case SQLErrorsCodes.DUPLICATE: {
      return { status: 409, message };
    }
  }
};