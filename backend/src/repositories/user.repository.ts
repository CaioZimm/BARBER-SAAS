import { Prisma } from '@prisma/client'
import prisma from '../config/prisma'

export class UserRepository {
  async findFirst(args: Prisma.UserFindFirstArgs): Promise<any> {
    return prisma.user.findFirst(args)
  }

  async findUnique(args: Prisma.UserFindUniqueArgs): Promise<any> {
    return prisma.user.findUnique(args)
  }

  async create(args: Prisma.UserCreateArgs): Promise<any> {
    return prisma.user.create(args)
  }
}
