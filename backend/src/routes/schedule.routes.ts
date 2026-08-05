import { Router } from 'express'
import { ScheduleController } from '../controllers/schedule.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()
const controller = new ScheduleController()

router.use(authenticate)
router.get('/working-hours', (req, res, next) => controller.getWorkingHours(req as any, res, next))
router.put('/working-hours', (req, res, next) => controller.upsertWorkingHours(req as any, res, next))
router.get('/blocked', (req, res, next) => controller.listBlockedSchedules(req as any, res, next))
router.post('/blocked', (req, res, next) => controller.createBlockedSchedule(req as any, res, next))
router.delete('/blocked/:id', (req, res, next) => controller.deleteBlockedSchedule(req as any, res, next))

export default router
