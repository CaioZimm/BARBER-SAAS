import { Router } from 'express'
import { ServiceController } from '../controllers/service.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()
const controller = new ServiceController()

router.use(authenticate)
router.get('/', (req, res, next) => controller.list(req as any, res, next))
router.get('/:id', (req, res, next) => controller.getById(req as any, res, next))
router.post('/', (req, res, next) => controller.create(req as any, res, next))
router.patch('/:id', (req, res, next) => controller.update(req as any, res, next))
router.delete('/:id', (req, res, next) => controller.delete(req as any, res, next))

export default router
