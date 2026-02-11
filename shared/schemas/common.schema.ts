import { z } from 'zod';

export const PaginationSchema = z.object({
  page: z.number().min(1),
  pageSize: z.number().min(1).max(100),
});

export type Pagination = z.infer<typeof PaginationSchema>;

export const PaginationMetaSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

export const ApiErrorResponseSchema = z.object({
  statusCode: z.number(),
  error: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
  timestamp: z.string(),
});

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

export const ApiSuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    meta: PaginationMetaSchema.optional(),
  });
