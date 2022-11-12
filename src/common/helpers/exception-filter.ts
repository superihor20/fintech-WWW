import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { QueryFailedError } from 'typeorm';

import { ErrorMessagesEnums } from '../enums/errors-messages.enum';

import { normalizeSQLError } from './normalize-sql-error';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: HttpException | QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      Logger.error(
        `Path ${request.url}: ${
          exception.message
        } | timestamp: ${new Date().toISOString()}`,
      );
      return response
        .status(exception.getStatus())
        .json(exception.getResponse());
    }

    if (exception instanceof QueryFailedError) {
      const normalizedSQLError = normalizeSQLError(
        exception.driverError.detail || exception.message,
        exception.driverError.code,
      );

      Logger.error(`Path ${request.url}: ${exception}`);

      return response
        .status(normalizedSQLError.status)
        .json(normalizedSQLError);
    }

    Logger.error(`Path ${request.url}: ${exception}`);

    return response.status(500).json({
      message: ErrorMessagesEnums.INTERNAL_SERVER_ERROR,
    });
  }
}
