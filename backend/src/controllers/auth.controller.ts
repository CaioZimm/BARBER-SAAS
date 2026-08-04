import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/auth.service'
import { registerSchema, loginSchema } from '../dtos/auth.dto'
import { AuthRequest } from '../middlewares/auth.middleware'

const authService = new AuthService()

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body)
      const result = await authService.register(data)
      res.status(201).json(result)
    } catch (err) { next(err) }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body)
      const result = await authService.login(data)
      res.json(result)
    } catch (err) { next(err) }
  }

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.me(req.user!.id)
      res.json(user)
    } catch (err) { next(err) }
  }
}
