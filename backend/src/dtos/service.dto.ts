import { z } from 'zod'

export const createServiceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  price: z.coerce.number().positive('Preço deve ser positivo'),
  duration: z.coerce.number().int().positive('Duração deve ser positiva (em minutos)'),
  photos: z.array(z.string().url('URL da foto inválida')).optional().default([]),
  active: z.boolean().optional().default(true),
})

export const updateServiceSchema = createServiceSchema.partial()

export type CreateServiceDTO = z.infer<typeof createServiceSchema>
export type UpdateServiceDTO = z.infer<typeof updateServiceSchema>
