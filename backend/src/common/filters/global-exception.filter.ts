import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { ERROR_CODES } from '@shared/constants/errors.js';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'INTERNAL_ERROR';
    let message = 'Une erreur interne est survenue';
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        // If it's already our formatted error, pass through
        if (resp['error'] && resp['timestamp']) {
          response.status(statusCode).json(resp);
          return;
        }
        error = (resp['error'] as string) ?? this.getErrorCode(statusCode);
        message = (resp['message'] as string) ?? message;
        details = resp['details'];
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = this.getErrorCode(statusCode);
      }
    } else {
      this.logger.error('Unhandled exception', exception instanceof Error ? exception.stack : exception);
    }

    response.status(statusCode).json({
      statusCode,
      error,
      message,
      ...(details !== undefined && { details }),
      timestamp: new Date().toISOString(),
    });
  }

  private getErrorCode(status: number): string {
    switch (status) {
      case 400: return ERROR_CODES.VALIDATION_ERROR;
      case 401: return ERROR_CODES.UNAUTHORIZED;
      case 403: return ERROR_CODES.FORBIDDEN;
      case 404: return ERROR_CODES.NOT_FOUND;
      case 429: return ERROR_CODES.RATE_LIMITED;
      default: return 'INTERNAL_ERROR';
    }
  }
}
