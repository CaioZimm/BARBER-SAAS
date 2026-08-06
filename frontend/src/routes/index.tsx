import { Routes, Route, Navigate } from 'react-router-dom'
import { PrivateRoutes } from './PrivateRoutes'
import { ClientRoutes } from './ClientRoutes'
import { GuestRoutes } from './GuestRoutes'

// Páginas Públicas/Clientes
import PublicBookingPage from '../pages/public/PublicBookingPage'
import BarbershopPage from '../pages/explore/BarbershopPage'
import ExplorePage from '../pages/explore/ExplorePage'
import RegisterPage from '../pages/auth/RegisterPage'
import LoginPage from '../pages/auth/LoginPage'

// Páginas Barber/Admin/SuperAdmin
import SuperAdminDashboard from '../pages/admin/SuperAdminDashboard'
import MyAppointmentsPage from '../pages/client/MyAppointmentsPage'
import OnboardingPage from '../pages/onboarding/OnboardingPage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import CustomersPage from '../pages/customers/CustomersPage'
import SettingsPage from '../pages/settings/SettingsPage'
import ServicesPage from '../pages/services/ServicesPage'
import BillingPage from '../pages/settings/BillingPage'
import AgendaPage from '../pages/agenda/AgendaPage'
import TeamPage from '../pages/team/TeamPage'

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

      {/* Portal do Cliente (Logado) */}
      <Route element={<ClientRoutes />}>
        <Route path="/meus-agendamentos" element={<MyAppointmentsPage />} />
      </Route>

      {/* Painel do Barbeiro */}
      <Route element={<PrivateRoutes />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/agenda" element={<AgendaPage />} />
        <Route path="/clientes" element={<CustomersPage />} />
        <Route path="/servicos" element={<ServicesPage />} />
        <Route path="/equipe" element={<TeamPage />} />
        <Route path="/configuracoes" element={<SettingsPage />} />
        <Route path="/assinatura" element={<BillingPage />} />
        <Route path="/admin" element={<SuperAdminDashboard />} />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/explore" replace />} />
      <Route path="*" element={<Navigate to="/explore" replace />} />
    </Routes>
  )
}