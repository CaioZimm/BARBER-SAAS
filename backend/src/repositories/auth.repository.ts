import { Prisma } from '@prisma/client'
import prisma from '../config/prisma'

export class AuthRepository {
  async findRefreshToken(token: string): Promise<any> {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    })
  }

  async createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<any> {
    return prisma.refreshToken.create({
      data: {
        token,
        user_id: userId,
        expires_at: expiresAt,
      },
    })
  }

  async deleteRefreshToken(id: string) {
    return prisma.refreshToken.delete({
      where: { id },
    })
  }

  async deleteAllUserTokens(userId: string) {
    return prisma.refreshToken.deleteMany({
      where: { user_id: userId },
    })
  }
}
