import { WorkingHoursRepository, BlockedScheduleRepository } from '../repositories/schedule.repository'
import { AppError } from '../middlewares/error.middleware'
import { WorkingHoursDTO, CreateBlockedScheduleDTO } from '../dtos/schedule.dto'

const workingHoursRepository = new WorkingHoursRepository()
const blockedScheduleRepository = new BlockedScheduleRepository()

export class ScheduleService {
  async getWorkingHours(userId: string) {
    return workingHoursRepository.findMany({
      where: { user_id: userId },
      orderBy: { day_of_week: 'asc' },
    })
  }

  async upsertWorkingHours(userId: string, data: WorkingHoursDTO) {
    return workingHoursRepository.upsert({
      where: { user_id_day_of_week: { user_id: userId, day_of_week: data.dayOfWeek } },
      update: {
        start_time: data.startTime,
        end_time: data.endTime,
        lunch_start: data.lunchStart,
        lunch_end: data.lunchEnd,
        active: data.active,
      },
      create: {
        user_id: userId,
        day_of_week: data.dayOfWeek,
        start_time: data.startTime,
        end_time: data.endTime,
        lunch_start: data.lunchStart,
        lunch_end: data.lunchEnd,
        active: data.active,
      },
    })
  }

  async listBlockedSchedules(userId: string, tenantId?: string) {
    if (tenantId) {
      return blockedScheduleRepository.findMany({
        where: { user: { tenant_id: tenantId } },
        orderBy: { start_date: 'asc' },
        include: { user: { select: { id: true, name: true } } }
      })
    }
    return blockedScheduleRepository.findMany({
      where: { user_id: userId },
      orderBy: { start_date: 'asc' },
      include: { user: { select: { id: true, name: true } } }
    })
  }

  async createBlockedSchedule(userId: string, data: CreateBlockedScheduleDTO) {
    return blockedScheduleRepository.create({
      data: {
        user_id: userId,
        start_date: new Date(data.startDate),
        end_date: new Date(data.endDate),
        reason: data.reason,
      },
    })
  }

  async deleteBlockedSchedule(userId: string, id: string, role?: string) {
    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN'
    const block = await blockedScheduleRepository.findFirst({ where: isAdmin ? { id } : { id, user_id: userId } })
    if (!block) throw new AppError('Bloqueio não encontrado', 404)
    await blockedScheduleRepository.delete({ where: { id } })
  }
}
