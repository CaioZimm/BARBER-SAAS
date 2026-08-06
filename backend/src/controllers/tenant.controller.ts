import { AuthRequest } from '../middlewares/auth.middleware'
import { AppError } from '../middlewares/error.middleware'
import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/prisma'
import { z } from 'zod'

const updateTenantSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  slug: z.string().min(3, 'Slug deve ter ao menos 3 caracteres').regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  logo: z.string().optional(),
  photos: z.array(z.string()).optional(),
  description: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})

export class TenantController {
  async get(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: req.user!.tenantId },
        select: { id: true, name: true, slug: true, active: true, logo: true, photos: true, description: true, phone: true, address: true }
      })
      res.json(tenant)
    } catch (err) { next(err) }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.user!.role !== 'ADMIN' && req.user!.role !== 'SUPER_ADMIN') {
        throw new AppError('Apenas administradores podem alterar as informações da barbearia', 403)
      }

      const data = updateTenantSchema.parse(req.body)

      const existingSlug = await prisma.tenant.findUnique({
        where: { slug: data.slug }
      })

      if (existingSlug && existingSlug.id !== req.user!.tenantId) {
        throw new AppError('Este link (slug) já está em uso por outra barbearia', 409)
      }

      const tenant = await prisma.tenant.update({
        where: { id: req.user!.tenantId },
        data: {
          name: data.name,
          slug: data.slug,
          logo: data.logo,
          photos: data.photos,
          description: data.description,
          phone: data.phone,
          address: data.address,
        },
        select: { id: true, name: true, slug: true, active: true, logo: true, photos: true, description: true, phone: true, address: true }
      })

      res.json(tenant)
    } catch (err) { next(err) }
  }
}
