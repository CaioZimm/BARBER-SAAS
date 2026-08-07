import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
    Carregando...
  </div>
)

export function PrivateRoutes() {
  const { token, user, isLoading } = useAuth()

  if (isLoading) return <LoadingSpinner />
  if (!token) return <Navigate to="/login" replace />

  if (user?.role === 'CLIENT') return <Navigate to="/explore" replace />
  if (!user?.tenant && user?.role !== 'SUPER_ADMIN') {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}

export function ClientRoutes() {
  const { token, user, isLoading } = useAuth()

  if (isLoading) return <LoadingSpinner />
  if (!token) return <Navigate to="/login" replace />
  if (user?.role !== 'CLIENT') return <Navigate to="/dashboard" replace />

  return <Outlet />
}

export function GuestRoutes() {
  const { token, user, isLoading } = useAuth()

  if (isLoading) return <LoadingSpinner />
  if (token) {
    if (user?.role === 'CLIENT') return <Navigate to="/explore" replace />
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
