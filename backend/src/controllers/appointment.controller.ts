import { createAppointmentSchema, updateAppointmentSchema, publicBookingSchema } from '../dtos/appointment.dto'
import { AppointmentService } from '../services/appointment.service'
import { AuthRequest } from '../middlewares/auth.middleware'
import { Request, Response, NextFunction } from 'express'

const appointmentService = new AppointmentService()

export class AppointmentController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.user!.role === 'CLIENT') {
        const appointments = await appointmentService.listClientAppointments(req.user!.id)
        return res.json(appointments)
      }

      const appointments = await appointmentService.list(
        req.user!.tenantId!,
        req.user!.id,
        req.user!.role,
        req.query.date as string,
        req.query.barberId as string
      )
      res.json(appointments)
    } catch (err) { next(err) }
  }

  async dashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await appointmentService.getDashboardStats(req.user!.tenantId!, req.user!.id)
      res.json(stats)
    } catch (err) { next(err) }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const appointment = await appointmentService.getById(req.user!.tenantId!, req.params.id as string)
      res.json(appointment)
    } catch (err) { next(err) }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createAppointmentSchema.parse(req.body)
      const appointment = await appointmentService.create(req.user!.tenantId!, req.user!.id, data)
      res.status(201).json(appointment)
    } catch (err) { next(err) }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateAppointmentSchema.parse(req.body)
      const appointment = await appointmentService.update(req.user!.tenantId!, req.user!.id, req.params.id as string, data)
      res.json(appointment)
    } catch (err) { next(err) }
  }

  async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.user!.role === 'CLIENT') {
        await appointmentService.clientCancel(req.user!.id, req.params.id as string)
      } else {
        await appointmentService.cancel(req.user!.tenantId!, req.params.id as string)
      }
      res.status(204).send()
    } catch (err) { next(err) }
  }

  // --- Endpoints públicos (sem auth) ---
  async getAvailableSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const barberId = req.query.barberId as string
      if (!barberId) {
        res.status(400).json({ error: 'O ID do barbeiro é obrigatório' })
        return
      }
      const slots = await appointmentService.getAvailableSlots(req.params.tenantSlug as string, req.query.date as string, barberId)
      res.json(slots)
    } catch (err) { next(err) }
  }

  async publicBook(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = publicBookingSchema.parse(req.body)
      const appointment = await appointmentService.publicBook(req.params.tenantSlug as string, req.user!.id, data)
      res.status(201).json(appointment)
    } catch (err) { next(err) }
  }
}
