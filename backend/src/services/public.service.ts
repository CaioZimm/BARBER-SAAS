import prisma from '../config/prisma'
import { AppError } from '../middlewares/error.middleware'

export class PublicService {
  /** Lista todas as barbearias ativas */
  async listBarbershops(search?: string) {
    return prisma.tenant.findMany({
      where: {
        active: true,
        ...(search
          ? { name: { contains: search, mode: 'insensitive' } }
          : {}),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        created_at: true,
        _count: {
          select: { services: true },
        },
        services: {
          where: { active: true },
          select: { price: true },
          take: 100,
        },
      },
      orderBy: { name: 'asc' },
    })
  }

  /** Retorna o perfil completo público de uma barbearia pelo slug */
  async getBarbershopBySlug(slug: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        services: {
          where: { active: true },
          select: { id: true, name: true, price: true, duration: true },
          orderBy: { name: 'asc' },
        },
        users: {
          where: { role: 'BARBER' },
          select: {
            id: true,
            name: true,
            working_hours: {
              where: { active: true },
              select: {
                day_of_week: true,
                start_time: true,
                end_time: true,
                lunch_start: true,
                lunch_end: true,
              },
              orderBy: { day_of_week: 'asc' },
            },
          },
        },
      },
    })

    if (!tenant || !tenant.services.length) {
      throw new AppError('Barbearia não encontrada', 404)
    }

    return tenant
  }
}
