import { z } from 'zod';

export const CreateGroupSchema = z.object({
    name: z.string().min(1, 'Le nom du groupe est requis').max(100, 'Le nom du groupe ne doit pas dépasser 100 caractères'),
});

export type CreateGroupDto = z.infer<typeof CreateGroupSchema>;

export const GroupResponseSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

export type GroupResponse = z.infer<typeof GroupResponseSchema>;

export const InviteUrlResponseSchema = z.object({
    url: z.string().url(),
    token: z.string().uuid(),
    expiresAt: z.string().datetime(),
});

export type InviteUrlResponse = z.infer<typeof InviteUrlResponseSchema>;
