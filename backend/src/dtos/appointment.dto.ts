import { z } from 'zod'

export const createAppointmentSchema = z.object({
  customerId: z.string().uuid('ID do cliente inválido'),
  serviceId: z.string().uuid('ID do serviço inválido'),
  barberId: z.string().uuid('ID do barbeiro inválido'),
  startDate: z.string().datetime('Data/hora inválida'),
})

export const updateAppointmentSchema = z.object({
  startDate: z.string().datetime().optional(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELED', 'NO_SHOW']).optional(),
})

export const publicBookingSchema = z.object({
  serviceId: z.string().uuid('ID do serviço inválido'),
  barberId: z.string().uuid('ID do barbeiro inválido'),
  startDate: z.string().datetime('Data/hora inválida'),
})

export type CreateAppointmentDTO = z.infer<typeof createAppointmentSchema>
export type UpdateAppointmentDTO = z.infer<typeof updateAppointmentSchema>
export type PublicBookingDTO = z.infer<typeof publicBookingSchema>
