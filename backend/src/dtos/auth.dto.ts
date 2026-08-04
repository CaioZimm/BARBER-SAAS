import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
  tenantName: z.string().min(2, 'Nome da barbearia deve ter ao menos 2 caracteres'),
  tenantSlug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
})

export const loginSchema = z.object({
  email: z.email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

export type RegisterDTO = z.infer<typeof registerSchema>
export type LoginDTO = z.infer<typeof loginSchema>
