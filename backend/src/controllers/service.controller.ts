import { createServiceSchema, updateServiceSchema } from '../dtos/service.dto'
import { ServiceService } from '../services/service.service'
import { AuthRequest } from '../middlewares/auth.middleware'
import { Response, NextFunction } from 'express'

const serviceService = new ServiceService()

export class ServiceController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const services = await serviceService.list(req.user!.tenantId!)
      res.json(services)
    } catch (err) { next(err) }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const service = await serviceService.getById(req.user!.tenantId!, req.params.id as string)
      res.json(service)
    } catch (err) { next(err) }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createServiceSchema.parse(req.body)
      const service = await serviceService.create(req.user!.tenantId!, data)
      res.status(201).json(service)
    } catch (err) { next(err) }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateServiceSchema.parse(req.body)
      const service = await serviceService.update(req.user!.tenantId!, req.params.id as string, data)
      res.json(service)
    } catch (err) { next(err) }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await serviceService.delete(req.user!.tenantId!, req.params.id as string)
      res.status(204).send()
    } catch (err) { next(err) }
  }
}
