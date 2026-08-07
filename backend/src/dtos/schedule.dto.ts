import { z } from 'zod'

export const workingHoursSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato inválido (HH:mm)'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato inválido (HH:mm)'),
  lunchStart: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  lunchEnd: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  active: z.boolean().optional().default(true),
})

export const createBlockedScheduleSchema = z.object({
  startDate: z.string().datetime('Data/hora de início inválida'),
  endDate: z.string().datetime('Data/hora de fim inválida'),
  reason: z.string().optional(),
  userId: z.string().uuid().optional(),
})

export type WorkingHoursDTO = z.infer<typeof workingHoursSchema>
export type CreateBlockedScheduleDTO = z.infer<typeof createBlockedScheduleSchema>
