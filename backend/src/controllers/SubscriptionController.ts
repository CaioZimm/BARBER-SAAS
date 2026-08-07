import { AuthRequest } from '../middlewares/auth.middleware'
import { prisma } from '../config/prisma'
import type { Response } from 'express'

export class SubscriptionController {
  async getPlans(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user
      if (!user || !user.tenantId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const plans = await prisma.plan.findMany()
      res.json({ plans })
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao buscar planos', details: error.message })
    }
  }

  async getStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user
      if (!user || !user.tenantId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      let subscription = await prisma.subscription.findUnique({
        where: { tenant_id: user.tenantId },
        include: { plan: true }
      })

      if (!subscription) {
        res.json({ subscription: null })
        return
      }

      res.json({ subscription })
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao buscar assinatura', details: error.message })
    }
  }

  async simulateSubscribe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user
      const { plan_id } = req.body

      if (!user || !user.tenantId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const plan = await prisma.plan.findUnique({ where: { id: plan_id } })
      if (!plan) {
        res.status(404).json({ error: 'Plano não encontrado' })
        return
      }

      const current_period_end = new Date()
      current_period_end.setMonth(current_period_end.getMonth() + 1)

      const subscription = await prisma.subscription.upsert({
        where: { tenant_id: user.tenantId },
        create: {
          tenant_id: user.tenantId,
          plan_id: plan.id,
          status: 'ACTIVE',
          current_period_end
        },
        update: {
          plan_id: plan.id,
          status: 'ACTIVE',
          current_period_end
        },
        include: { plan: true }
      })

      await prisma.payment.create({
        data: {
          tenant_id: user.tenantId,
          amount: plan.price,
          status: 'PAID',
          payment_method: 'credit_card',
        }
      })

      res.json({ message: 'Assinatura realizada com sucesso', subscription })
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao assinar plano', details: error.message })
    }
  }
}
