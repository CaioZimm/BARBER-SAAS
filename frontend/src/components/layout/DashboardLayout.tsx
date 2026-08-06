import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Sidebar from './Sidebar'
import { motion } from 'framer-motion'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-zinc-950">
      <Sidebar />
      <main className="flex-1 overflow-auto relative">
        <motion.div 
          className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}
