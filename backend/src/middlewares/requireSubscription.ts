import type { Response, NextFunction } from 'express'
import { AuthRequest } from './auth.middleware'
import { prisma } from '../config/prisma'

export const requireSubscription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const user = req.user

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  // Se for super admin ou cliente, pode ignorar a checagem de assinatura
  if (user.role === 'SUPER_ADMIN' || user.role === 'CLIENT') {
    next()
    return
  }

  if (!user.tenantId) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
      include: { subscription: true },
    })

    if (!tenant) {
      res.status(404).json({ error: 'Tenant not found' })
      return
    }

    // Para o MVP (Simulação), se não tiver assinatura ou se não estiver ACTIVE/TRIAL, vamos permitir 
    // ou podemos bloquear. Vamos bloquear se a assinatura existir e for PAST_DUE/CANCELED
    // Se não tiver assinatura nenhuma, permitiremos acesso de "graça" por enquanto ou forçamos a criação.
    // Como a spec pede "bloquear acesso ao painel caso assinatura expire":
    if (tenant.subscription) {
      if (tenant.subscription.status === 'CANCELED' || tenant.subscription.status === 'PAST_DUE') {
         res.status(402).json({ error: 'Payment Required. Subscription is inactive.' })
         return
      }
    }

    next()
  } catch (error) {
    console.error('requireSubscription error:', error)
    res.status(500).json({ error: 'Error checking subscription status' })
  }
}
