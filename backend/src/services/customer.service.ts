import prisma from '../config/prisma'
import { AppError } from '../middlewares/error.middleware'
import { CreateCustomerDTO, UpdateCustomerDTO } from '../dtos/customer.dto'

export class CustomerService {
  async list(tenantId: string, search?: string) {
    return prisma.customer.findMany({
      where: {
        tenant_id: tenantId,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
              ],
            }
          : {}),
      },
      orderBy: { name: 'asc' },
    })
  }

  async getById(tenantId: string, id: string) {
    const customer = await prisma.customer.findFirst({
      where: { id, tenant_id: tenantId },
      include: {
        appointments: {
          include: { service: true },
          orderBy: { start_date: 'desc' },
          take: 10,
        },
      },
    })
    if (!customer) throw new AppError('Cliente não encontrado', 404)
    return customer
  }

  async create(tenantId: string, data: CreateCustomerDTO) {
    return prisma.customer.create({
      data: {
        tenant_id: tenantId,
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        notes: data.notes,
      },
    })
  }

  async update(tenantId: string, id: string, data: UpdateCustomerDTO) {
    await this.getById(tenantId, id)
    return prisma.customer.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phone && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    })
  }

  async delete(tenantId: string, id: string) {
    await this.getById(tenantId, id)
    await prisma.customer.delete({ where: { id } })
  }
}
