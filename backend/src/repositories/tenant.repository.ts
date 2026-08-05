import { Prisma } from '@prisma/client'
import prisma from '../config/prisma'

export class TenantRepository {
  async findMany(args: Prisma.TenantFindManyArgs) {
    return prisma.tenant.findMany(args)
  }

  async findUnique(args: Prisma.TenantFindUniqueArgs): Promise<any> {
    return prisma.tenant.findUnique(args)
  }

  async create(args: Prisma.TenantCreateArgs): Promise<any> {
    return prisma.tenant.create(args)
  }
}
