import { AuthRequest } from '../middlewares/auth.middleware'
import { prisma } from '../config/prisma'
import type { Response } from 'express'
import bcrypt from 'bcrypt'

export class EmployeeController {
  // Lista todos os barbeiros/funcionários do Tenant
  async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenantId
      if (!tenant_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const employees = await prisma.user.findMany({
        where: { tenant_id, role: { in: ['BARBER', 'ADMIN'] } },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          photo: true,
          bio: true,
          commission_rate: true,
          is_active_barber: true,
          created_at: true,
          services: {
            select: { id: true, name: true, price: true }
          }
        },
        orderBy: { name: 'asc' }
      })

      res.json(employees)
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao listar equipe', details: error.message })
    }
  }

  // Cria um novo barbeiro
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenantId
      if (!tenant_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      // Check max barbers limit from plan
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenant_id },
        include: { subscription: { include: { plan: true } } }
      })

      const maxBarbers = tenant?.subscription?.plan?.max_barbers || 10 // Aumentado para 10 no MVP/Testes
      const currentBarbersCount = await prisma.user.count({
        where: { tenant_id, is_active_barber: true }
      })

      if (currentBarbersCount >= maxBarbers) {
        res.status(403).json({ error: `O seu plano permite no máximo ${maxBarbers} barbeiros ativos.` })
        return
      }

      const { name, email, password, commission_rate, bio, service_ids } = req.body

      const userExists = await prisma.user.findUnique({ where: { email } })
      if (userExists) {
        res.status(400).json({ error: 'Email já cadastrado.' })
        return
      }

      const password_hash = await bcrypt.hash(password, 8)

      const employee = await prisma.user.create({
        data: {
          tenant_id,
          name,
          email,
          password_hash,
          role: 'BARBER',
          commission_rate: commission_rate ? parseFloat(commission_rate) : null,
          bio,
          is_active_barber: true,
          services: {
            connect: service_ids?.map((id: string) => ({ id })) || []
          }
        },
        select: { id: true, name: true, email: true }
      })

      res.status(201).json(employee)
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao criar barbeiro', details: error.message })
    }
  }

  // Atualiza um barbeiro (incluindo o próprio ADMIN caso ele edite o próprio perfil como barbeiro)
  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenantId!
      const { id } = req.params
      const { name, email, commission_rate, bio, is_active_barber, service_ids, password } = req.body

      const data: any = {
        name,
        email,
        commission_rate: commission_rate !== undefined ? parseFloat(commission_rate) : null,
        bio,
        is_active_barber,
        services: {
          set: service_ids?.map((s_id: string) => ({ id: s_id })) || []
        }
      }

      if (password) {
        data.password_hash = await bcrypt.hash(password, 8)
      }

      const employee = await prisma.user.update({
        where: { id: id as string, tenant_id },
        data,
        select: { id: true, name: true, email: true, is_active_barber: true }
      })

      res.json(employee)
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao atualizar barbeiro', details: error.message })
    }
  }
}
