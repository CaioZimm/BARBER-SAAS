import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, addDays, subDays, startOfWeek, addWeeks, subWeeks, isSameDay, parseISO, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, X, Check } from 'lucide-react'
import { appointmentsService } from '../../services/appointmentsService'
import { customersService } from '../../services/customersService'
import { barberServicesService } from '../../services/barberServicesService'
import { employeeService } from '../../services/employeeService'
import type { Appointment, Service, Customer } from '../../interfaces'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import StatusBadge from '../../components/ui/StatusBadge'
import { useAuth } from '../../hooks/useAuth'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { cn, formatCurrency } from '../../utils'

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 08:00 - 20:00

export default function AgendaPage() {
  const queryClient = useQueryClient()
  const [viewDate, setViewDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState<'week' | 'day'>('week')
  const [newModalOpen, setNewModalOpen] = useState(false)
  const [detailApt, setDetailApt] = useState<Appointment | null>(null)
  const [newForm, setNewForm] = useState({ customerId: '', serviceId: '', barberId: '', date: format(new Date(), 'yyyy-MM-dd'), time: '09:00' })
  const [selectedBarber, setSelectedBarber] = useState('all')
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'BARBER' || user?.role === 'SUPER_ADMIN'

  const weekStart = startOfWeek(viewDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const queryDate = view === 'day' ? format(selectedDate, 'yyyy-MM-dd') : undefined

  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ['appointments', queryDate, selectedBarber],
    queryFn: () => appointmentsService.getAppointments(queryDate, selectedBarber === 'all' ? undefined : selectedBarber),
  })

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: () => customersService.getCustomers(),
  })

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: () => barberServicesService.getServices(),
  })

  const { data: employees = [] } = useQuery<any[]>({
    queryKey: ['employees'],
    queryFn: () => employeeService.list(),
  })

  const createMutation = useMutation({
    mutationFn: (newApt: { customerId: string; serviceId: string; barberId: string; startDate: string }) =>
      appointmentsService.createAppointment(newApt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      setNewModalOpen(false)
      setNewForm({ customerId: '', serviceId: '', barberId: '', date: format(new Date(), 'yyyy-MM-dd'), time: '09:00' })
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      appointmentsService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      setDetailApt(null)
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => appointmentsService.cancelAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      setDetailApt(null)
    },
  })

  const getAptForDayHour = (day: Date, hour: number) =>
    appointments.filter((a) => {
      const d = parseISO(a.start_date)
      return isSameDay(d, day) && d.getHours() === hour
    })

  const dayApts = appointments.filter((a) => isSameDay(parseISO(a.start_date), selectedDate))

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button onClick={() => view === 'week' ? setViewDate(subWeeks(viewDate, 1)) : setSelectedDate(subDays(selectedDate, 1))} className="p-2 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors shrink-0">
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-base sm:text-lg font-semibold text-white capitalize truncate">
              {view === 'week'
                ? `${format(weekStart, 'dd MMM', { locale: ptBR })} — ${format(addDays(weekStart, 6), 'dd MMM yyyy', { locale: ptBR })}`
                : format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </h2>
            <button onClick={() => view === 'week' ? setViewDate(addWeeks(viewDate, 1)) : setSelectedDate(addDays(selectedDate, 1))} className="p-2 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors shrink-0">
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => { setViewDate(new Date()); setSelectedDate(new Date()) }}
              className="text-xs text-amber-400 hover:text-amber-300 px-2 py-1 rounded border border-amber-500/20 hover:bg-amber-500/10 transition-colors shrink-0"
            >
              Hoje
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-zinc-800 rounded-lg p-1">
              <button onClick={() => setView('week')} className={cn('px-3 py-1 text-sm rounded-md transition-colors', view === 'week' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white')}>Semana</button>
              <button onClick={() => setView('day')} className={cn('px-3 py-1 text-sm rounded-md transition-colors', view === 'day' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white')}>Dia</button>
            </div>
              <select
                className="bg-zinc-800 text-zinc-100 text-sm rounded-lg px-3 py-1.5 border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-amber-500 max-w-[150px]"
                value={selectedBarber}
                onChange={(e) => setSelectedBarber(e.target.value)}
              >
                <option value="all">Todos barbeiros</option>
                {employees.filter(e => e.is_active_barber).map(e => (
                  <option key={e.id} value={e.id}>{e.name.split(' ')[0]}</option>
                ))}
              </select>
            <Button onClick={() => setNewModalOpen(true)} className="shrink-0">
              <Plus size={16} /> Agendar
            </Button>
          </div>
        </div>

        {/* Week View */}
        {view === 'week' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-auto">
            {/* Day headers */}
            <div className="grid grid-cols-8 border-b border-zinc-800 min-w-[700px]">
              <div className="w-16" />
              {weekDays.map((day) => (
                <div
                  key={day.toISOString()}
                  onClick={() => { setSelectedDate(day); setView('day') }}
                  className={cn(
                    'p-3 text-center cursor-pointer hover:bg-zinc-800 transition-colors',
                    isToday(day) && 'bg-amber-500/5'
                  )}
                >
                  <p className="text-xs text-zinc-500 uppercase">{format(day, 'EEE', { locale: ptBR })}</p>
                  <p className={cn('text-lg font-bold mt-0.5', isToday(day) ? 'text-amber-400' : 'text-white')}>
                    {format(day, 'd')}
                  </p>
                </div>
              ))}
            </div>
            {/* Time grid */}
            <div className="max-h-[600px] overflow-y-auto">
              {HOURS.map((hour) => (
                <div key={hour} className="grid grid-cols-8 border-b border-zinc-800/50 min-h-[60px] min-w-[700px]">
                  <div className="w-16 flex items-start justify-end pr-3 pt-1">
                    <span className="text-xs text-zinc-600">{String(hour).padStart(2, '0')}:00</span>
                  </div>
                  {weekDays.map((day) => {
                    const apts = getAptForDayHour(day, hour)
                    return (
                      <div key={day.toISOString()} className={cn('p-1 border-l border-zinc-800/50', isToday(day) && 'bg-amber-500/5')}>
                        {apts.map((apt) => (
                          <button
                            key={apt.id}
                            onClick={() => setDetailApt(apt)}
                            className={cn(
                              'w-full text-left px-2 py-1 rounded-md text-xs mb-0.5 transition-all hover:opacity-90',
                              apt.status === 'SCHEDULED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                apt.status === 'COMPLETED' ? 'bg-green-500/15 text-green-300 border border-green-500/20' :
                                  'bg-zinc-700 text-zinc-400 border border-zinc-600'
                            )}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <p className="font-semibold truncate">{apt.customer.name}</p>
                              {isAdmin && apt.user && selectedBarber === 'all' && (
                                <span className="text-[10px] bg-black/20 px-1 rounded truncate shrink-0 max-w-[50px]">{apt.user.name.split(' ')[0]}</span>
                              )}
                            </div>
                            <p className="truncate opacity-75">{apt.service.name}</p>
                          </button>
                        ))}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Day View */}
        {view === 'day' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {dayApts.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-zinc-500">Nenhum agendamento neste dia</p>
                <Button className="mt-4" onClick={() => setNewModalOpen(true)}><Plus size={16} /> Criar agendamento</Button>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {dayApts.map((apt) => (
                  <button key={apt.id} onClick={() => setDetailApt(apt)} className="w-full text-left p-4 hover:bg-zinc-800/40 transition-colors flex items-center gap-4">
                    <div className="text-center w-14 shrink-0">
                      <p className="text-base font-bold text-white">{format(parseISO(apt.start_date), 'HH:mm')}</p>
                      <p className="text-xs text-zinc-500">{format(parseISO(apt.end_date), 'HH:mm')}</p>
                    </div>
                    <div className="w-1 h-10 rounded-full bg-amber-500 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white">{apt.customer.name}</p>
                        {isAdmin && apt.user && selectedBarber === 'all' && (
                          <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{apt.user.name}</span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-400">{apt.service.name} · {formatCurrency(Number(apt.service.price))}</p>
                    </div>
                    <StatusBadge status={apt.status} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* New Appointment Modal */}
        <Modal isOpen={newModalOpen} onClose={() => setNewModalOpen(false)} title="Novo agendamento">
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-300">Cliente *</label>
              <select
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={newForm.customerId}
                onChange={(e) => setNewForm((f) => ({ ...f, customerId: e.target.value }))}
              >
                <option value="">Selecione o cliente</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-300">Serviço *</label>
              <select
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={newForm.serviceId}
                onChange={(e) => setNewForm((f) => ({ ...f, serviceId: e.target.value }))}
              >
                <option value="">Selecione o serviço</option>
                {services.filter((s) => s.active).map((s) => (
                  <option key={s.id} value={s.id}>{s.name} — {formatCurrency(Number(s.price))} ({s.duration}min)</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-300">Barbeiro *</label>
              <select
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={newForm.barberId}
                onChange={(e) => setNewForm((f) => ({ ...f, barberId: e.target.value }))}
              >
                <option value="">Selecione o barbeiro</option>
                {employees.filter(e => e.is_active_barber).map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-300">Data *</label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={newForm.date}
                  onChange={(e) => setNewForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-300">Horário *</label>
                <input
                  type="time"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={newForm.time}
                  onChange={(e) => setNewForm((f) => ({ ...f, time: e.target.value }))}
                />
              </div>
            </div>
            {createMutation.error && (
              <p className="text-sm text-red-400">{(createMutation.error as any)?.response?.data?.error}</p>
            )}
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" className="flex-1" onClick={() => setNewModalOpen(false)}>Cancelar</Button>
              <Button
                className="flex-1"
                isLoading={createMutation.isPending}
                onClick={() => createMutation.mutate({
                  customerId: newForm.customerId,
                  serviceId: newForm.serviceId,
                  barberId: newForm.barberId,
                  startDate: new Date(`${newForm.date}T${newForm.time}:00`).toISOString(),
                })}
                disabled={!newForm.customerId || !newForm.serviceId || !newForm.barberId}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </Modal>

        {/* Detail Modal */}
        {detailApt && (
          <Modal isOpen={!!detailApt} onClose={() => setDetailApt(null)} title="Detalhes do agendamento">
            <div className="space-y-4">
              <div className="bg-zinc-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-3">
                  {detailApt.customer.user?.photo ? (
                    <img src={detailApt.customer.user.photo} alt={detailApt.customer.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                      {detailApt.customer.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-white">{detailApt.customer.name}</p>
                    <p className="text-sm text-zinc-400">{detailApt.customer.phone}</p>
                  </div>
                  <div className="ml-auto">
                    <StatusBadge status={detailApt.status} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-zinc-800 rounded-lg p-3">
                  <p className="text-zinc-500 text-xs">Serviço</p>
                  <p className="text-white font-medium mt-1">{detailApt.service.name}</p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-3">
                  <p className="text-zinc-500 text-xs">Valor</p>
                  <p className="text-green-400 font-bold mt-1">{formatCurrency(Number(detailApt.service.price))}</p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-3">
                  <p className="text-zinc-500 text-xs">Início</p>
                  <p className="text-white font-medium mt-1">{format(parseISO(detailApt.start_date), 'HH:mm')}</p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-3">
                  <p className="text-zinc-500 text-xs">Término</p>
                  <p className="text-white font-medium mt-1">{format(parseISO(detailApt.end_date), 'HH:mm')}</p>
                </div>
              </div>

              {detailApt.status === 'SCHEDULED' && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => updateStatusMutation.mutate({ id: detailApt.id, status: 'COMPLETED' })}
                    isLoading={updateStatusMutation.isPending}
                  >
                    <Check size={14} /> Concluir
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    className="flex-1"
                    onClick={() => cancelMutation.mutate(detailApt.id)}
                    isLoading={cancelMutation.isPending}
                  >
                    <X size={14} /> Cancelar
                  </Button>
                </div>
              )}
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  )
}
