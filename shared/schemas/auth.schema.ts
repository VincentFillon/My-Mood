import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  email: z.string().email('Format d\'email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères requis').max(128),
  gdprConsent: z.literal(true, {
    message: 'Vous devez accepter les conditions d\'utilisation',
  }),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const RegisterResponseSchema = z.object({
  accessToken: z.string(),
  user: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
  }),
});

export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

export const LoginSchema = z.object({
  email: z.string().email('Format d\'email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const LoginResponseSchema = RegisterResponseSchema;

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
