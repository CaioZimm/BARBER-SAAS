import { Prisma } from '@prisma/client'
import prisma from '../config/prisma'

export class ServiceRepository {
  async findAll(tenantId: string) {
    return prisma.service.findMany({
      where: { tenant_id: tenantId },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { appointments: true } },
      },
    })
  }

  async findActive(tenantId: string) {
    return prisma.service.findMany({
      where: { tenant_id: tenantId, active: true },
      orderBy: { name: 'asc' },
    })
  }

  async findById(tenantId: string, id: string) {
    return prisma.service.findFirst({
      where: { id, tenant_id: tenantId },
    })
  }

  async create(data: Prisma.ServiceUncheckedCreateInput) {
    return prisma.service.create({ data })
  }

  async update(tenantId: string, id: string, data: Prisma.ServiceUpdateInput) {
    const service = await prisma.service.findFirst({ where: { id, tenant_id: tenantId } })
    if (!service) return null
    return prisma.service.update({
      where: { id },
      data,
    })
  }

  async delete(tenantId: string, id: string) {
    const service = await prisma.service.findFirst({ where: { id, tenant_id: tenantId } })
    if (!service) return null
    return prisma.service.delete({
      where: { id },
    })
  }
}
