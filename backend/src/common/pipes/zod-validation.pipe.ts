import {
  PipeTransform,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import type { ZodSchema, ZodError } from 'zod';
import { ERROR_CODES } from '@shared/constants/errors.js';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (result.success) {
      return result.data;
    }

    const zodError = result.error as ZodError;
    throw new BadRequestException({
      statusCode: 400,
      error: ERROR_CODES.VALIDATION_ERROR,
      message: 'Les données soumises sont invalides',
      details: zodError.issues.map((issue) => ({
        field: issue.path.join('.'),
        issue: issue.message,
      })),
      timestamp: new Date().toISOString(),
    });
  }
}
