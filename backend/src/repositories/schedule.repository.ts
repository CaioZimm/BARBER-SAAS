import { Prisma } from '@prisma/client'
import prisma from '../config/prisma'

export class WorkingHoursRepository {
  async findFirst(args: Prisma.WorkingHoursFindFirstArgs) {
    return prisma.workingHours.findFirst(args)
  }

  async findMany(args: Prisma.WorkingHoursFindManyArgs) {
    return prisma.workingHours.findMany(args)
  }

  async upsert(args: Prisma.WorkingHoursUpsertArgs) {
    return prisma.workingHours.upsert(args)
  }
}

export class BlockedScheduleRepository {
  async findMany(args: Prisma.BlockedScheduleFindManyArgs) {
    return prisma.blockedSchedule.findMany(args)
  }

  async create(args: Prisma.BlockedScheduleCreateArgs) {
    return prisma.blockedSchedule.create(args)
  }

  async findFirst(args: Prisma.BlockedScheduleFindFirstArgs) {
    return prisma.blockedSchedule.findFirst(args)
  }

  async delete(args: Prisma.BlockedScheduleDeleteArgs) {
    return prisma.blockedSchedule.delete(args)
  }
}
