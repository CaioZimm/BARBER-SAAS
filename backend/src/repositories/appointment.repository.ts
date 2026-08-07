import { Prisma } from '@prisma/client'
import prisma from '../config/prisma'

export class AppointmentRepository {
  async hasConflict(userId: string, startDate: Date, endDate: Date, excludeId?: string) {
    const conflict = await prisma.appointment.findFirst({
      where: {
        user_id: userId,
        status: { in: ['SCHEDULED'] },
        id: excludeId ? { not: excludeId } : undefined,
        OR: [
          { start_date: { lte: startDate }, end_date: { gt: startDate } },
          { start_date: { lt: endDate }, end_date: { gte: endDate } },
          { start_date: { gte: startDate }, end_date: { lte: endDate } },
        ],
      },
    })
    return !!conflict
  }

  async findAll(tenantId: string, userId?: string, start?: Date, end?: Date) {
    const where: Prisma.AppointmentWhereInput = { tenant_id: tenantId }
    if (userId) {
      where.user_id = userId
    }
    if (start && end) {
      where.start_date = { gte: start, lte: end }
    }
    
    return prisma.appointment.findMany({
      where,
      include: { customer: { include: { user: { select: { photo: true } } } }, service: true },
      orderBy: { start_date: 'asc' },
    })
  }

  async findById(tenantId: string, id: string) {
    return prisma.appointment.findFirst({
      where: { id, tenant_id: tenantId },
      include: { customer: { include: { user: { select: { photo: true } } } }, service: true, user: { select: { id: true, name: true } } },
    })
  }

  async findDashboardStats(tenantId: string, userId: string, startOfToday: Date, endOfToday: Date, sevenDaysAgo: Date) {
    const todayAppointments = await prisma.appointment.findMany({
      where: { tenant_id: tenantId, user_id: userId, start_date: { gte: startOfToday, lte: endOfToday } },
      include: { customer: { include: { user: { select: { photo: true } } } }, service: true },
      orderBy: { start_date: 'asc' },
    })

    const pastWeekAppointments = await prisma.appointment.findMany({
      where: {
        tenant_id: tenantId,
        user_id: userId,
        status: 'COMPLETED',
        start_date: { gte: sevenDaysAgo, lte: endOfToday },
      },
      include: { service: true },
    })

    return { todayAppointments, pastWeekAppointments }
  }

  async create(data: Prisma.AppointmentUncheckedCreateInput) {
    return prisma.appointment.create({
      data,
      include: { customer: { include: { user: { select: { photo: true } } } }, service: true },
    })
  }

  async update(tenantId: string, id: string, data: Prisma.AppointmentUpdateInput) {
    const appointment = await prisma.appointment.findFirst({ where: { id, tenant_id: tenantId } })
    if (!appointment) return null

    return prisma.appointment.update({
      where: { id },
      data,
      include: { customer: { include: { user: { select: { photo: true } } } }, service: true },
    })
  }

  async delete(tenantId: string, id: string) {
    const appointment = await prisma.appointment.findFirst({ where: { id, tenant_id: tenantId } })
    if (!appointment) return null

    return prisma.appointment.delete({
      where: { id },
    })
  }
}
