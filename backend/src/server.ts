import rateLimit from 'express-rate-limit'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import path from 'path'
import 'dotenv/config'

import { authenticate as requireAuth } from './middlewares/auth.middleware'
import { requireSubscription } from './middlewares/requireSubscription'
import { errorHandler } from './middlewares/error.middleware'
import subscriptionRoutes from './routes/subscription.routes'
import appointmentRoutes from './routes/appointment.routes'
import employeeRoutes from './routes/employee.routes'
import scheduleRoutes from './routes/schedule.routes'
import customerRoutes from './routes/customer.routes'
import serviceRoutes from './routes/service.routes'
import publicRoutes from './routes/public.routes'
import tenantRoutes from './routes/tenant.routes'
import uploadRoutes from './routes/upload.routes'
import adminRoutes from './routes/admin.routes'
import authRoutes from './routes/auth.routes'

const app = express()

// Security Middlewares
app.use(express.json())
app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 1000, // aumentado de 100 para evitar bloqueio em dev
  standardHeaders: true,
  legacyHeaders: false,
}))

// Test API
app.get('/api', (_, res) => res.send('Hello World!'))
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/public', publicRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/subscriptions', subscriptionRoutes)

// Protected SaaS Routes
app.use('/api/customers', requireAuth, requireSubscription, customerRoutes)
app.use('/api/services', requireAuth, requireSubscription, serviceRoutes)
app.use('/api/employees', requireAuth, requireSubscription, employeeRoutes)
app.use('/api/tenant', requireAuth, requireSubscription, tenantRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/schedule', requireAuth, requireSubscription, scheduleRoutes)
app.use('/api/upload', requireAuth, uploadRoutes)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// 404 Not Found
app.use((req, res) => {
  res.status(404).json({ error: `Rota ${req.method} ${req.path} não encontrada` })
})

// Global Error Handler
app.use(errorHandler)

// Server
const PORT = process.env.PORT || 3333
app.listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT}`)
})

export default app