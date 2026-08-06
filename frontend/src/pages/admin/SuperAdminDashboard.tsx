import { Users, Store, DollarSign, CalendarCheck } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { adminService } from '../../services/adminService'
import { Card, StatCard } from '../../components/ui/Card'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../hooks/useAuth'
import { Navigate } from 'react-router-dom'

export default function SuperAdminDashboard() {
  const { user } = useAuth()

  const { data: stats } = useQuery({
    queryKey: ['saas-stats'],
    queryFn: () => adminService.getStats(),
    enabled: user?.role === 'SUPER_ADMIN',
  })

  const { data: tenants = [], isLoading: loadingTenants } = useQuery({
    queryKey: ['saas-tenants'],
    queryFn: () => adminService.getTenants(),
    enabled: user?.role === 'SUPER_ADMIN',
  })

  if (user?.role !== 'SUPER_ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Painel Super Admin</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total de Barbearias"
            value={stats?.totalTenants ?? 0}
            icon={<Store className="w-5 h-5 text-amber-500" />}
          />
          <StatCard
            title="Clientes (Geral)"
            value={stats?.totalCustomers ?? 0}
            icon={<Users className="w-5 h-5 text-blue-500" />}
          />
          <StatCard
            title="Agendamentos (Geral)"
            value={stats?.totalAppointments ?? 0}
            icon={<CalendarCheck className="w-5 h-5 text-green-500" />}
          />
          <StatCard
            title="Assinaturas Ativas"
            value={stats?.activeSubscriptions ?? 0}
            icon={<DollarSign className="w-5 h-5 text-emerald-500" />}
          />
        </div>

        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Barbearias Cadastradas</h2>
            {loadingTenants ? (
              <p className="text-zinc-400">Carregando...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400">
                      <th className="pb-3 font-medium">Nome</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Plano / Vencimento</th>
                      <th className="pb-3 font-medium">Criado em</th>
                    </tr>
                  </thead>
                  <tbody className="text-zinc-300">
                    {tenants.map((t: any) => (
                      <tr key={t.id} className="border-b border-zinc-800/50">
                        <td className="py-4">
                          <div className="font-medium text-white">{t.name}</div>
                          <div className="text-xs text-zinc-500">/{t.slug}</div>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                            {t.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="py-4">
                          {t.subscription ? (
                            <>
                              <div className="text-sm">{t.subscription.plan.name}</div>
                              <div className="text-xs text-zinc-500">Vence: {new Date(t.subscription.current_period_end).toLocaleDateString()}</div>
                            </>
                          ) : (
                            <span className="text-zinc-500 text-sm">Sem assinatura</span>
                          )}
                        </td>
                        <td className="py-4 text-sm text-zinc-400">
                          {new Date(t.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
