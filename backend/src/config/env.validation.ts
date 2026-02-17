import { z } from 'zod';

export const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),

  // Cloudflare R2 (required in production/development, optional in test)
  R2_ACCOUNT_ID: z.string().min(1, 'R2_ACCOUNT_ID is required').optional(),
  R2_ACCESS_KEY_ID: z.string().min(1, 'R2_ACCESS_KEY_ID is required').optional(),
  R2_SECRET_ACCESS_KEY: z.string().min(1, 'R2_SECRET_ACCESS_KEY is required').optional(),
  R2_BUCKET_NAME: z.string().min(1, 'R2_BUCKET_NAME is required').optional(),
  R2_PUBLIC_URL: z.string().url().optional(),

  // App
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  API_PORT: z.coerce.number().default(3000),
  FRONTEND_PORT: z.coerce.number().default(4200),
  FRONTEND_URL: z.string().url().default('http://localhost:4200'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  return envSchema.parse(config);
}
