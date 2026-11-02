import { z } from 'zod';

const email = z.string().trim().toLowerCase().pipe(z.email('Email inválido'));

export const registerSchema = z.object({
    email,
    // bcrypt solo usa los primeros 72 bytes.
    password: z.string().min(8, 'Mínimo 8 caracteres').max(72, 'Máximo 72 caracteres'),
});

export const loginSchema = z.object({
    email,
    password: z.string().min(1).max(72),
});
