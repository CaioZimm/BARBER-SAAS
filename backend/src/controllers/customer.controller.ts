import { Response, NextFunction } from 'express'
import { CustomerService } from '../services/customer.service'
import { createCustomerSchema, updateCustomerSchema } from '../dtos/customer.dto'
import { AuthRequest } from '../middlewares/auth.middleware'

const customerService = new CustomerService()

export class CustomerController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customers = await customerService.list(req.user!.tenantId, req.query.search as string)
      res.json(customers)
    } catch (err) { next(err) }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customer = await customerService.getById(req.user!.tenantId, req.params.id as string)
      res.json(customer)
    } catch (err) { next(err) }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createCustomerSchema.parse(req.body)
      const customer = await customerService.create(req.user!.tenantId, data)
      res.status(201).json(customer)
    } catch (err) { next(err) }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateCustomerSchema.parse(req.body)
      const customer = await customerService.update(req.user!.tenantId, req.params.id as string, data)
      res.json(customer)
    } catch (err) { next(err) }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await customerService.delete(req.user!.tenantId, req.params.id as string)
      res.status(204).send()
    } catch (err) { next(err) }
  }
}
