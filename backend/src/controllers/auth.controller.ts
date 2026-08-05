import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/auth.service'
import { registerSchema, loginSchema } from '../dtos/auth.dto'

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

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.me((req as any).user.id)
      res.json(user)
    } catch (err) { next(err) }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body
      if (!refreshToken) {
        res.status(401).json({ error: 'Refresh token não fornecido' })
        return
      }

      const tokens = await authService.refresh(refreshToken)
      res.json(tokens)
    } catch (err) { next(err) }
  }
}
