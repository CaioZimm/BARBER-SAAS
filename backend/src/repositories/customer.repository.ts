import { Prisma } from '@prisma/client'
import prisma from '../config/prisma'

export class CustomerRepository {
  async findAll(tenantId: string, search?: string, filter?: string) {
    const where: Prisma.CustomerWhereInput = { tenant_id: tenantId }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }
    let customers = await prisma.customer.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        _count: { select: { appointments: true } },
        appointments: {
          orderBy: { start_date: 'desc' },
          take: 1,
          select: { start_date: true }
        }
      },
    })

    let result = customers.map(c => ({
      ...c,
      total_appointments: c._count.appointments,
      last_visit: c.appointments.length > 0 ? c.appointments[0].start_date : null
    }))

    if (filter === 'frequent') {
      result.sort((a, b) => b.total_appointments - a.total_appointments)
    } else if (filter === 'recent') {
      result.sort((a, b) => {
        if (!a.last_visit) return 1
        if (!b.last_visit) return -1
        return new Date(b.last_visit).getTime() - new Date(a.last_visit).getTime()
      })
    } else if (filter === 'dormant') {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      result = result.filter(c => c.last_visit && new Date(c.last_visit) < thirtyDaysAgo)
    }

    return result
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
