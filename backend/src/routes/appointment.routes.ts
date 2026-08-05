import { Router } from 'express'
import { AppointmentController } from '../controllers/appointment.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()
const controller = new AppointmentController()

// Rotas públicas (sem auth) - devem vir antes do middleware
router.get('/public/:tenantSlug/slots', (req, res, next) => controller.getAvailableSlots(req, res, next))
router.post('/public/:tenantSlug/book', (req, res, next) => controller.publicBook(req, res, next))

// Rotas protegidas
router.use(authenticate)
router.get('/dashboard', (req, res, next) => controller.dashboard(req as any, res, next))
router.get('/', (req, res, next) => controller.list(req as any, res, next))
router.get('/:id', (req, res, next) => controller.getById(req as any, res, next))
router.post('/', (req, res, next) => controller.create(req as any, res, next))
router.patch('/:id', (req, res, next) => controller.update(req as any, res, next))
router.delete('/:id/cancel', (req, res, next) => controller.cancel(req as any, res, next))

export default router
