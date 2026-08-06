import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function PrivateRoutes() {
  const { token, user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Carregando...
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (user?.role === 'CLIENT') {
    return <Navigate to="/explore" replace />
  }

  return <Outlet />
}