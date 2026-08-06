import { Router } from 'express'
import { TenantController } from '../controllers/tenant.controller'

const router = Router()
const controller = new TenantController()

router.get('/', (req, res, next) => controller.get(req as any, res, next))
router.put('/', (req, res, next) => controller.update(req as any, res, next))

export default router
