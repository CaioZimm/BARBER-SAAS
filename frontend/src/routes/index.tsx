import { Routes, Route, Navigate } from 'react-router-dom'
import { PrivateRoutes } from './PrivateRoutes'
import { GuestRoutes } from './GuestRoutes'

// Páginas Públicas
import PublicBookingPage from '../pages/public/PublicBookingPage'
import BarbershopPage from '../pages/explore/BarbershopPage'
import ExplorePage from '../pages/explore/ExplorePage'
import RegisterPage from '../pages/auth/RegisterPage'
import LoginPage from '../pages/auth/LoginPage'

// Páginas Privadas
import DashboardPage from '../pages/dashboard/DashboardPage'
import CustomersPage from '../pages/customers/CustomersPage'
import SettingsPage from '../pages/settings/SettingsPage'
import ServicesPage from '../pages/services/ServicesPage'
import AgendaPage from '../pages/agenda/AgendaPage'

export function AppRoutes() {
  return (
    <Routes>
      {/* Portal do Cliente */}
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/barbearia/:slug" element={<BarbershopPage />} />
      <Route path="/booking/:slug" element={<PublicBookingPage />} />

      {/* Rotas de Autenticação (Apenas Deslogados) */}
      <Route element={<GuestRoutes />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Painel do Barbeiro */}
      <Route element={<PrivateRoutes />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/agenda" element={<AgendaPage />} />
        <Route path="/clientes" element={<CustomersPage />} />
        <Route path="/servicos" element={<ServicesPage />} />
        <Route path="/configuracoes" element={<SettingsPage />} />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/explore" replace />} />
      <Route path="*" element={<Navigate to="/explore" replace />} />
    </Routes>
  )
}