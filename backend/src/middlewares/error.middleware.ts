import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('[Error]', err)

  if (err instanceof ZodError) {
    return res.status(422).json({
      error: 'Dados inválidos',
      issues: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    })
  }

  const statusCode = (err as any).statusCode || 500
  const message = statusCode < 500 ? err.message : 'Erro interno do servidor'

  return res.status(statusCode).json({ error: message })
}

export class AppError extends Error {
  constructor(public message: string, public statusCode: number = 400) {
    super(message)
    this.name = 'AppError'
  }
}
