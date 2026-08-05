import { Prisma } from '@prisma/client'
import prisma from '../config/prisma'

export class CustomerRepository {
  async findAll(tenantId: string, search?: string) {
    const where: Prisma.CustomerWhereInput = { tenant_id: tenantId }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }
    return prisma.customer.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        _count: { select: { appointments: true } },
      },
    })
  }

  async findById(tenantId: string, id: string) {
    return prisma.customer.findFirst({
      where: { id, tenant_id: tenantId },
      include: {
        appointments: {
          orderBy: { start_date: 'desc' },
          take: 5,
          include: { service: true },
        },
      },
    })
  }

  async findByPhone(tenantId: string, phone: string) {
    return prisma.customer.findFirst({
      where: { tenant_id: tenantId, phone },
    })
  }

  async create(data: Prisma.CustomerUncheckedCreateInput) {
    return prisma.customer.create({ data })
  }

  async update(tenantId: string, id: string, data: Prisma.CustomerUpdateInput) {
    // Para retornar o customer atualizado com tenant_id na clausula where 
    // Usaremos findFirst + update, pois o update exige ID unico
    const customer = await prisma.customer.findFirst({ where: { id, tenant_id: tenantId }})
    if (!customer) return null
    return prisma.customer.update({
      where: { id },
      data,
    })
  }

  async delete(tenantId: string, id: string) {
    const customer = await prisma.customer.findFirst({ where: { id, tenant_id: tenantId }})
    if (!customer) return null
    return prisma.customer.delete({
      where: { id },
    })
  }
}
