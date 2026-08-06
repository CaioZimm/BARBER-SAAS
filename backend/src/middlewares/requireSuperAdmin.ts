import type { Response, NextFunction } from 'express'
import { Role } from '@prisma/client'
import { AuthRequest } from './auth.middleware'

export const requireSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const user = req.user
  if (!user || user.role !== Role.SUPER_ADMIN) {
    res.status(403).json({ error: 'Access denied. Super Admin only.' })
    return
  }
  next()
}
