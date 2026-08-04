import { z } from 'zod'

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  phone: z.string().min(10, 'Telefone inválido').max(20),
  email: z.email('Email inválido').optional().or(z.literal('')),
  notes: z.string().optional(),
})

export const updateCustomerSchema = createCustomerSchema.partial()

export type CreateCustomerDTO = z.infer<typeof createCustomerSchema>
export type UpdateCustomerDTO = z.infer<typeof updateCustomerSchema>
