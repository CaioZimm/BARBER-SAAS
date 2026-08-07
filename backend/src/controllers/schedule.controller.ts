import { workingHoursSchema, createBlockedScheduleSchema } from '../dtos/schedule.dto'
import { ScheduleService } from '../services/schedule.service'
import { AuthRequest } from '../middlewares/auth.middleware'
import { Response, NextFunction } from 'express'

const scheduleService = new ScheduleService()

export class ScheduleController {
  async getWorkingHours(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const hours = await scheduleService.getWorkingHours(req.user!.id)
      res.json(hours)
    } catch (err) { next(err) }
  }

  async upsertWorkingHours(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = workingHoursSchema.parse(req.body)
      const hours = await scheduleService.upsertWorkingHours(req.user!.id, data)
      res.json(hours)
    } catch (err) { next(err) }
  }

  async listBlockedSchedules(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const isAdmin = req.user!.role === 'ADMIN' || req.user!.role === 'SUPER_ADMIN'
      const blocks = await scheduleService.listBlockedSchedules(req.user!.id, isAdmin ? req.user!.tenantId : undefined)
      res.json(blocks)
    } catch (err) { next(err) }
  }

  async createBlockedSchedule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createBlockedScheduleSchema.parse(req.body)
      const isAdmin = req.user!.role === 'ADMIN' || req.user!.role === 'SUPER_ADMIN'
      const targetUserId = (isAdmin && data.userId) ? data.userId : req.user!.id
      const block = await scheduleService.createBlockedSchedule(targetUserId, data)
      res.status(201).json(block)
    } catch (err) { next(err) }
  }

  async deleteBlockedSchedule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await scheduleService.deleteBlockedSchedule(req.user!.id, req.params.id as string, req.user!.role)
      res.status(204).send()
    } catch (err) { next(err) }
  }
}
