import { z } from 'zod'

export const createAppointmentSchema = z.object({
  customerId: z.string().uuid('ID do cliente inválido'),
  serviceId: z.string().uuid('ID do serviço inválido'),
  startDate: z.string().datetime('Data/hora inválida'),
})

export const updateAppointmentSchema = z.object({
  startDate: z.string().datetime().optional(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELED', 'NO_SHOW']).optional(),
})

export const publicBookingSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  phone: z.string().min(10, 'Telefone inválido').max(20),
  serviceId: z.string().uuid('ID do serviço inválido'),
  startDate: z.string().datetime('Data/hora inválida'),
})

export type CreateAppointmentDTO = z.infer<typeof createAppointmentSchema>
export type UpdateAppointmentDTO = z.infer<typeof updateAppointmentSchema>
export type PublicBookingDTO = z.infer<typeof publicBookingSchema>
