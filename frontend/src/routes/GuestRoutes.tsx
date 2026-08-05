import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function GuestRoutes() {
  const { token, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Carregando...
      </div>
    )
  }

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}