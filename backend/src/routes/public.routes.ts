import { Router } from 'express'
import { PublicController } from '../controllers/public.controller'

const router = Router()
const controller = new PublicController()

// GET /api/public/barbershops
router.get('/barbershops', (req, res, next) => controller.listBarbershops(req, res, next))
// GET /api/public/barbershops/:slug
router.get('/barbershops/:slug', (req, res, next) => controller.getBarbershopBySlug(req, res, next))

export default router
