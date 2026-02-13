import { z } from 'zod';

// Note: Both fields are required — the frontend always sends the full profile.
// Use .partial() if partial updates are needed in the future.
export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  email: z.string().email('Format d\'email invalide'),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
