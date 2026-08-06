import { Router } from 'express'
import { SubscriptionController } from '../controllers/SubscriptionController'
import { authenticate as requireAuth } from '../middlewares/auth.middleware'

const router = Router()
const subscriptionController = new SubscriptionController()

router.use(requireAuth)

router.get('/me', subscriptionController.getStatus.bind(subscriptionController))
router.post('/simulate', subscriptionController.simulateSubscribe.bind(subscriptionController))

export default router
