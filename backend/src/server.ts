import rateLimit from 'express-rate-limit'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import 'dotenv/config'

import { errorHandler } from './middlewares/error.middleware'
import appointmentRoutes from './routes/appointment.routes'
import scheduleRoutes from './routes/schedule.routes'
import customerRoutes from './routes/customer.routes'
import serviceRoutes from './routes/service.routes'
import publicRoutes from './routes/public.routes'
import authRoutes from './routes/auth.routes'

const app = express()

// Security Middlewares
app.use(express.json())
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}))

// Test API
app.get('/api', (_, res) => res.send('Hello World!'))
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/schedule', scheduleRoutes)
app.use('/api/public', publicRoutes)

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