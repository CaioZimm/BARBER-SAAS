import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.email('Email inválido'),
  password: z.string().min(4, 'Senha deve ter ao menos 4 caracteres'),
  phone: z.string().min(10, 'Telefone inválido'),
  tenantName: z.string().min(2, 'Nome da barbearia deve ter ao menos 2 caracteres'),
  tenantSlug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  tenantPhone: z.string().optional(),
  tenantAddress: z.string().optional(),
  tenantDescription: z.string().optional(),
  tenantLogo: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

export const registerClientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  password: z.string().min(4, 'Senha deve ter ao menos 4 caracteres'),
})

export type RegisterDTO = z.infer<typeof registerSchema>
export type LoginDTO = z.infer<typeof loginSchema>
export type RegisterClientDTO = z.infer<typeof registerClientSchema>
