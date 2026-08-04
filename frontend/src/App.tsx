import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import AgendaPage from './pages/agenda/AgendaPage'
import CustomersPage from './pages/customers/CustomersPage'
import ServicesPage from './pages/services/ServicesPage'
import SettingsPage from './pages/settings/SettingsPage'
import PublicBookingPage from './pages/public/PublicBookingPage'
import ExplorePage from './pages/explore/ExplorePage'
import BarbershopPage from './pages/explore/BarbershopPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
                    {/* Portal do Cliente (público) */}
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/barbearia/:slug" element={<BarbershopPage />} />
            <Route path="/booking/:slug" element={<PublicBookingPage />} />

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected - Painel do Barbeiro */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/agenda" element={<AgendaPage />} />
            <Route path="/clientes" element={<CustomersPage />} />
            <Route path="/servicos" element={<ServicesPage />} />
            <Route path="/configuracoes" element={<SettingsPage />} />

                        {/* Redirects */}
            <Route path="/" element={<Navigate to="/explore" replace />} />
            <Route path="*" element={<Navigate to="/explore" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
