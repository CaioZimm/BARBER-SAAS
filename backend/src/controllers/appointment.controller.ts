import { Request, Response, NextFunction } from 'express'
import { AppointmentService } from '../services/appointment.service'
import { createAppointmentSchema, updateAppointmentSchema, publicBookingSchema } from '../dtos/appointment.dto'
import { AuthRequest } from '../middlewares/auth.middleware'

const appointmentService = new AppointmentService()

export class AppointmentController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const appointments = await appointmentService.list(
        req.user!.tenantId,
        req.user!.id,
        req.query.date as string
      )
      res.json(appointments)
    } catch (err) { next(err) }
  }

  async dashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await appointmentService.getDashboardStats(req.user!.tenantId, req.user!.id)
      res.json(stats)
    } catch (err) { next(err) }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const appointment = await appointmentService.getById(req.user!.tenantId, req.params.id as string)
      res.json(appointment)
    } catch (err) { next(err) }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createAppointmentSchema.parse(req.body)
      const appointment = await appointmentService.create(req.user!.tenantId, req.user!.id, data)
      res.status(201).json(appointment)
    } catch (err) { next(err) }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateAppointmentSchema.parse(req.body)
      const appointment = await appointmentService.update(req.user!.tenantId, req.user!.id, req.params.id as string, data)
      res.json(appointment)
    } catch (err) { next(err) }
  }

  async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await appointmentService.cancel(req.user!.tenantId, req.params.id as string)
      res.status(204).send()
    } catch (err) { next(err) }
  }

  // --- Endpoints públicos (sem auth) ---
  async getAvailableSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const slots = await appointmentService.getAvailableSlots(req.params.tenantSlug as string, req.query.date as string)
      res.json(slots)
    } catch (err) { next(err) }
  }

  async publicBook(req: Request, res: Response, next: NextFunction) {
    try {
      const data = publicBookingSchema.parse(req.body)
      const appointment = await appointmentService.publicBook(req.params.tenantSlug as string, data)
      res.status(201).json(appointment)
    } catch (err) { next(err) }
  }
}
