import { PublicService } from '../services/public.service'
import { Request, Response, NextFunction } from 'express'

const publicService = new PublicService()

export class PublicController {
  async listBarbershops(req: Request, res: Response, next: NextFunction) {
    try {
      const barbershops = await publicService.listBarbershops(req.query.search as string)
      res.json(barbershops)
    } catch (err) { next(err) }
  }

  async getBarbershopBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug
      const barbershop = await publicService.getBarbershopBySlug(slug)
      res.json(barbershop)
    } catch (err) { next(err) }
  }
}
