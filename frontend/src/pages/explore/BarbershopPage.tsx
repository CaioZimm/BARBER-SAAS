import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { format, parseISO, addMinutes } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, Scissors, Clock, Calendar, CheckCircle, ChevronRight, MapPin, Sparkles } from 'lucide-react'
import { publicService } from '../../services/publicService'
import { appointmentsService } from '../../services/appointmentsService'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import type { Service, Barbershop } from '../../interfaces'
import { formatCurrency } from '../../utils'
import { cn } from '../../utils'

type Step = 'profile' | 'slots' | 'info' | 'success'
const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function BarbershopPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('profile')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', phone: '' })
  const [isBooking, setIsBooking] = useState(false)
  const [bookingError, setBookingError] = useState('')

  // Fetch barbershop profile
  const { data: shop, isLoading, isError } = useQuery<Barbershop>({
    queryKey: ['barbershop', slug],
    queryFn: () => publicService.getBarbershopBySlug(slug!),
    enabled: !!slug,
  })

  // Fetch available slots when date/service changes
  const { data: slots = [], isFetching: isLoadingSlots } = useQuery<string[]>({
    queryKey: ['slots', slug, selectedDate],
    queryFn: () =>
      appointmentsService.getPublicSlots(slug!, selectedDate),
    enabled: step === 'slots' && !!slug && !!selectedDate,
  })

  // ── Booking ────────────────────────────────────────────────────────────────
  const handleBook = async () => {
    if (!selectedSlot || !selectedService || !slug) return
    setIsBooking(true)
    setBookingError('')
    try {
      await appointmentsService.bookPublicAppointment(slug, {
        name: form.name,
        phone: form.phone,
        serviceId: selectedService.id,
        startDate: selectedSlot,
      })
      setStep('success')
    } catch (e: any) {
      setBookingError(e?.response?.data?.error || 'Erro ao agendar. Tente novamente.')
    } finally {
      setIsBooking(false)
    }
  }

  // ── Loading / Error ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isError || !shop) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 p-6">
        <Scissors size={48} className="text-zinc-700" />
        <p className="text-zinc-400 text-lg font-medium">Barbearia não encontrada</p>
        <Button onClick={() => navigate('/explore')}>
          <ArrowLeft size={16} /> Voltar à busca
        </Button>
      </div>
    )
  }

  const workingHours = shop.users[0]?.working_hours ?? []

  // ── Success ────────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center gap-6">
        <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <CheckCircle size={40} className="text-green-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Agendamento confirmado!</h2>
          <p className="text-zinc-400 max-w-xs">
            Seu horário em{' '}
            <span className="text-amber-400 font-semibold">{shop.name}</span>{' '}
            foi reservado para{' '}
            <span className="text-white font-semibold">
              {selectedSlot && format(parseISO(selectedSlot), "dd/MM 'às' HH:mm", { locale: ptBR })}
            </span>
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 w-full max-w-xs space-y-3 text-sm text-left">
          <div className="flex items-center gap-2 text-zinc-400">
            <Scissors size={14} className="text-amber-400 shrink-0" />
            <span>{selectedService?.name}</span>
            <span className="ml-auto text-green-400 font-bold">{formatCurrency(Number(selectedService?.price ?? 0))}</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <Clock size={14} className="text-amber-400 shrink-0" />
            <span>{selectedService?.duration} minutos</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <Calendar size={14} className="text-amber-400 shrink-0" />
            <span>
              {selectedSlot &&
                format(parseISO(selectedSlot), "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <Button
            onClick={() => {
              setStep('profile')
              setSelectedService(null)
              setSelectedSlot(null)
              setForm({ name: '', phone: '' })
            }}
          >
            Fazer outro agendamento
          </Button>
          <Button variant="ghost" onClick={() => navigate('/explore')}>
            <ArrowLeft size={14} /> Explorar outras barbearias
          </Button>
        </div>
      </div>
    )
  }

  // ── Main Layout ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => step === 'profile' ? navigate('/explore') : setStep(step === 'slots' ? 'profile' : step === 'info' ? 'slots' : 'profile')}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-white truncate">{shop.name}</h1>
            <p className="text-xs text-zinc-500 flex items-center gap-1">
              <MapPin size={10} /> @{shop.slug}
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
            <Scissors size={14} className="text-white" />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-12">

        {/* ── STEP: Profile ──────────────────────────────────────────────── */}
        {step === 'profile' && (
          <div className="space-y-8 pt-6">
            {/* Hero card */}
            <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-amber-500/10 to-zinc-900 p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-bold text-2xl shrink-0">
                  {shop.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{shop.name}</h2>
                  <p className="text-sm text-zinc-400 mt-0.5 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-400" />
                    {shop.services.length} serviço{shop.services.length !== 1 ? 's' : ''} disponível{shop.services.length !== 1 ? 'eis' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Services */}
            <section>
              <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <Scissors size={16} className="text-amber-400" /> Serviços e Preços
              </h3>
              <div className="space-y-2">
                {shop.services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => { setSelectedService(service); setStep('slots') }}
                    className="w-full text-left flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <Scissors size={16} className="text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                        {service.name}
                      </p>
                      <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                        <Clock size={11} /> {service.duration} minutos
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-semibold text-green-400">{formatCurrency(Number(service.price))}</span>
                      <p className="text-xs text-amber-400 mt-0.5 flex items-center gap-1 justify-end">
                        Agendar <ChevronRight size={11} />
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Working Hours */}
            {workingHours.length > 0 && (
              <section>
                <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                  <Clock size={16} className="text-amber-400" /> Horários de Funcionamento
                </h3>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 divide-y divide-zinc-800 overflow-hidden">
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                    const wh = workingHours.find((w) => w.day_of_week === day)
                    return (
                      <div key={day} className="flex items-center px-4 py-3 text-sm">
                        <span className="w-10 text-zinc-500 font-medium">{DAY_NAMES[day]}</span>
                        {wh ? (
                          <>
                            <span className="text-white flex-1">
                              {wh.start_time} — {wh.end_time}
                            </span>
                            {wh.lunch_start && (
                              <span className="text-xs text-zinc-500">
                                Almoço: {wh.lunch_start}–{wh.lunch_end}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-zinc-600 flex-1">Fechado</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ── STEP: Slots ────────────────────────────────────────────────── */}
        {step === 'slots' && selectedService && (
          <div className="space-y-6 pt-6">
            {/* Selected service summary */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                <Scissors size={16} className="text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">{selectedService.name}</p>
                <p className="text-xs text-zinc-400">{selectedService.duration} min</p>
              </div>
              <p className="text-green-400 font-bold">{formatCurrency(Number(selectedService.price))}</p>
            </div>

            {/* Date picker */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <Calendar size={15} className="text-amber-400" /> Escolha a data
              </label>
              <input
                type="date"
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={selectedDate}
                onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(null) }}
              />
            </div>

            {/* Time slots */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <Clock size={15} className="text-amber-400" /> Horários disponíveis
              </label>
              {isLoadingSlots ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-8 rounded-xl border border-zinc-800 bg-zinc-900">
                  <Clock size={32} className="text-zinc-700 mx-auto mb-2" />
                  <p className="text-zinc-500 text-sm">Nenhum horário disponível neste dia</p>
                  <p className="text-zinc-600 text-xs mt-1">Tente outro dia</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {slots.map((slot) => {
                    const endSlot = addMinutes(parseISO(slot), selectedService.duration)
                    return (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={cn(
                          'flex flex-col items-center py-2.5 rounded-xl border text-xs font-medium transition-all',
                          selectedSlot === slot
                            ? 'bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/20'
                            : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-amber-500/50 hover:bg-amber-500/5 hover:text-amber-400'
                        )}
                      >
                        <span className="font-bold text-sm">{format(parseISO(slot), 'HH:mm')}</span>
                        <span className="text-[10px] opacity-70">até {format(endSlot, 'HH:mm')}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={!selectedSlot}
              onClick={() => setStep('info')}
            >
              Continuar <ChevronRight size={16} />
            </Button>
          </div>
        )}

        {/* ── STEP: Info ─────────────────────────────────────────────────── */}
        {step === 'info' && selectedService && selectedSlot && (
          <div className="space-y-5 pt-6">
            {/* Booking summary card */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-800/50">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Resumo do agendamento</p>
              </div>
              <div className="p-4 space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Scissors size={14} className="text-amber-400 shrink-0" />
                  <span className="text-zinc-300 flex-1">{selectedService.name}</span>
                  <span className="font-medium">{formatCurrency(Number(selectedService.price))}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-amber-400 shrink-0" />
                  <span className="text-zinc-300">{selectedService.duration} minutos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-amber-400 shrink-0" />
                  <span className="text-white font-medium">
                    {format(parseISO(selectedSlot), "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer form */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Seus dados</h3>
              <Input
                id="book-name"
                label="Seu nome *"
                placeholder="João Silva"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              <Input
                id="book-phone"
                label="WhatsApp *"
                placeholder="(11) 99999-9999"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>

            {bookingError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {bookingError}
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              isLoading={isBooking}
              disabled={!form.name || !form.phone}
              onClick={handleBook}
            >
              <CheckCircle size={16} /> Confirmar agendamento
            </Button>
            <p className="text-center text-xs text-zinc-600">
              Ao confirmar, você concorda em comparecer no horário marcado.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
