import { z } from 'zod'

export const createServiceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  price: z.number().positive('Preço deve ser positivo'),
  duration: z.number().int().positive('Duração deve ser positiva (em minutos)'),
  active: z.boolean().optional().default(true),
})

export const updateServiceSchema = createServiceSchema.partial()

export type CreateServiceDTO = z.infer<typeof createServiceSchema>
export type UpdateServiceDTO = z.infer<typeof updateServiceSchema>
