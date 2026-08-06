import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()
const controller = new AuthController()

router.post('/register', (req, res, next) => controller.register(req, res, next))
router.post('/register-client', (req, res, next) => controller.registerClient(req, res, next))
router.post('/login', (req, res, next) => controller.login(req, res, next))
router.post('/refresh', (req, res, next) => controller.refresh(req, res, next))
router.get('/me', authenticate, (req, res, next) => controller.me(req as any, res, next))
router.put('/me', authenticate, (req, res, next) => controller.updateMe(req as any, res, next))

export default router