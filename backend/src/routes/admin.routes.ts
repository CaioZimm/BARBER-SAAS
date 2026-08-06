import { Router } from 'express'
import { authenticate as requireAuth } from '../middlewares/auth.middleware'
import { requireSuperAdmin } from '../middlewares/requireSuperAdmin'
import { AdminController } from '../controllers/AdminController'

const router = Router()
const adminController = new AdminController()

router.use(requireAuth)

// SaaS Dashboard / Tenants
router.get('/stats', requireSuperAdmin, adminController.getSaaSStats)
router.get('/tenants', requireSuperAdmin, adminController.listTenants)

// Plans (CRUD)
router.get('/plans', adminController.listPlans) // Qualquer usuário logado pode listar os planos para assinar
router.post('/plans', requireSuperAdmin, adminController.createPlan)
router.put('/plans/:id', requireSuperAdmin, adminController.updatePlan)

export default router
