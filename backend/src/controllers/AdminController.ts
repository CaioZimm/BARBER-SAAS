import type { Request, Response } from 'express'
import { prisma } from '../config/prisma'

export class AdminController {
  // === PLANOS ===
  async listPlans(req: Request, res: Response): Promise<void> {
    try {
      const plans = await prisma.plan.findMany()
      res.json(plans)
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao listar planos', details: error.message })
    }
  }

  async createPlan(req: Request, res: Response): Promise<void> {
    try {
      const { name, price, max_barbers } = req.body
      const plan = await prisma.plan.create({
        data: { name, price, max_barbers }
      })
      res.status(201).json(plan)
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao criar plano', details: error.message })
    }
  }

  async updatePlan(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { name, price, max_barbers, active } = req.body
      const plan = await prisma.plan.update({
        where: { id: id as string },
        data: { name, price, max_barbers, active }
      })
      res.json(plan)
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao atualizar plano', details: error.message })
    }
  }

  // === INFORMAÇÕES DO SAAS (DASHBOARD SUPER ADMIN) ===
  async getSaaSStats(req: Request, res: Response): Promise<void> {
    try {
      const totalTenants = await prisma.tenant.count()
      const totalCustomers = await prisma.customer.count()
      const totalAppointments = await prisma.appointment.count()
      const activeSubscriptions = await prisma.subscription.count({
        where: { status: 'ACTIVE' }
      })

      res.json({
        totalTenants,
        totalCustomers,
        totalAppointments,
        activeSubscriptions
      })
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao buscar métricas', details: error.message })
    }
  }

  // === LISTA DE TENANTS (BARBEARIAS) ===
  async listTenants(req: Request, res: Response): Promise<void> {
    try {
      const tenants = await prisma.tenant.findMany({
        include: {
          users: { select: { name: true, email: true, role: true } },
          subscription: { include: { plan: true } }
        }
      })
      res.json(tenants)
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao listar barbearias', details: error.message })
    }
  }
}
