import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Clock, DollarSign, ChevronRight, Scissors } from 'lucide-react'
import { dashboardService } from '../../services/dashboardService'
import DashboardLayout from '../../components/layout/DashboardLayout'
import type { DashboardStats } from '../../interfaces'
import { StatCard } from '../../components/ui/Card'
import { Card } from '../../components/ui/Card'
import StatusBadge from '../../components/ui/StatusBadge'
import { formatCurrency } from '../../utils'
import { useAuth } from '../../hooks/useAuth'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function DashboardPage() {
  const { user } = useAuth()

  const { data, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.getDashboardStats(),
    refetchInterval: 60_000,
  })

  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })
  const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1)

  const upcoming = data?.todayAppointments.filter(
    (a) => a.status === 'SCHEDULED' && new Date(a.start_date) > new Date()
  ) || []

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between mt-12 lg:mt-1">
          <div>
            <h1 className="text-2xl font-bold text-white">Olá, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-zinc-400 mt-1">{todayCapitalized}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Atendimentos hoje"
            value={isLoading ? '—' : data?.totalCount || 0}
            icon={<Calendar size={20} />}
            color="blue"
          />
          <StatCard
            title="Concluídos"
            value={isLoading ? '—' : data?.completedCount || 0}
            icon={<Scissors size={20} />}
            color="green"
          />
          <StatCard
            title="Próximos"
            value={isLoading ? '—' : upcoming.length}
            icon={<Clock size={20} />}
            color="amber"
          />
          <StatCard
            title="Faturamento"
            value={isLoading ? '—' : formatCurrency(data?.revenue || 0)}
            icon={<DollarSign size={20} />}
            color="purple"
          />
        </div>

        {/* Gráfico de Faturamento */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-6">
              Faturamento (Últimos 7 dias)
            </h2>
            <div className="h-[300px] w-full">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.chartData || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#a1a1aa"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="#a1a1aa"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `R$ ${value}`}
                    />
                    <Tooltip
                      cursor={{ fill: '#27272a', opacity: 0.4 }}
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                      itemStyle={{ color: '#fbbf24', fontWeight: 'bold' }}
                      formatter={(value: any) => [formatCurrency(value as number), 'Faturamento']}
                      labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                    />
                    <Bar
                      dataKey="total"
                      fill="#fbbf24"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Next Appointment */}
          <div className="lg:col-span-1">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Próximo cliente
            </h2>
            {data?.nextAppointment ? (
              <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-lg font-bold shrink-0">
                    {data.nextAppointment.customer.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">
                      {data.nextAppointment.customer.name}
                    </p>
                    <p className="text-sm text-amber-400 font-medium mt-0.5">
                      {data.nextAppointment.service.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 text-zinc-400 text-xs">
                      <Clock size={12} />
                      {format(new Date(data.nextAppointment.start_date), 'HH:mm')} —{' '}
                      {format(new Date(data.nextAppointment.end_date), 'HH:mm')}
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card>
                <div className="text-center py-4">
                  <Clock size={32} className="text-zinc-700 mx-auto mb-2" />
                  <p className="text-sm text-zinc-500">Nenhum agendamento pendente</p>
                </div>
              </Card>
            )}
          </div>

          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Agenda de hoje
            </h2>
            <Card className="divide-y divide-zinc-800 p-0 overflow-hidden">
              {isLoading ? (
                <div className="p-6 text-center">
                  <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : data?.todayAppointments.length === 0 ? (
                <div className="p-8 text-center">
                  <Calendar size={40} className="text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500">Nenhum agendamento para hoje</p>
                </div>
              ) : (
                data?.todayAppointments.map((apt) => (
                  <div key={apt.id} className="flex items-center gap-4 p-4 hover:bg-zinc-800/40 transition-colors">
                    <div className="text-center w-14 shrink-0">
                      <p className="text-base font-bold text-white">
                        {format(new Date(apt.start_date), 'HH:mm')}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {format(new Date(apt.end_date), 'HH:mm')}
                      </p>
                    </div>
                    <div className="w-px h-10 bg-zinc-800 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{apt.customer.name}</p>
                      <p className="text-sm text-zinc-400">{apt.service.name}</p>
                    </div>
                    <StatusBadge status={apt.status} />
                    <ChevronRight size={16} className="text-zinc-600 shrink-0" />
                  </div>
                ))
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
