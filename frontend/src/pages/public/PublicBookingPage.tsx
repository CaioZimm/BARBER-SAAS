import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Scissors, CheckCircle, Clock, User, Calendar, MapPin, Building } from 'lucide-react'
import { appointmentsService } from '../../services/appointmentsService'
import { publicService } from '../../services/publicService'
import Button from '../../components/ui/Button'
import { formatCurrency } from '../../utils'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

type Step = 'barber' | 'service' | 'datetime' | 'info' | 'success'

export default function PublicBookingPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tenant, setTenant] = useState<any>(null)
  const [slots, setSlots] = useState<string[]>([])
  const [step, setStep] = useState<Step>('barber')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [selectedBarber, setSelectedBarber] = useState<any>(null)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  useEffect(() => {
    publicService.getBarbershopBySlug(slug)
      .then((data) => setTenant(data))
      .catch(() => setError('Barbearia não encontrada'))
  }, [slug])

  useEffect(() => {
    if (step === 'datetime' && selectedBarber) {
      appointmentsService.getPublicSlots(slug, selectedDate, selectedBarber.id)
        .then((data) => setSlots(data))
        .catch(() => setSlots([]))
    }
  }, [selectedDate, step, slug, selectedBarber])

  const handleBook = async () => {
    if (!selectedSlot || !selectedService || !selectedBarber) return
    setIsLoading(true)
    setError('')
    try {
      await appointmentsService.bookPublicAppointment(slug, {
        serviceId: selectedService.id,
        barberId: selectedBarber.id,
        startDate: selectedSlot,
      })
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] })
      setStep('success')
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Erro ao agendar')
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Agendado!</h2>
          <p className="text-zinc-400">
            Seu agendamento com <span className="font-semibold text-white">{selectedBarber?.name}</span> foi confirmado para{' '}
            <span className="text-amber-400 font-semibold">
              {selectedSlot && format(parseISO(selectedSlot), "dd/MM 'às' HH:mm", { locale: ptBR })}
            </span>
          </p>
          <Button className="w-full" onClick={() => navigate('/meus-agendamentos')}>
            Ver meus agendamentos
          </Button>
        </div>
      </div>
    )
  }

  if (error && !tenant) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="text-center text-zinc-400">{error}</div>
      </div>
    )
  }

  const stepsList: Step[] = ['barber', 'service', 'datetime', 'info']
  const currentStepIndex = stepsList.indexOf(step)

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="max-w-lg mx-auto p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center overflow-hidden border border-zinc-700 shrink-0">
              {tenant?.logo ? (
                <img src={tenant.logo} alt={tenant.name} className="w-full h-full object-cover" />
              ) : (
                <Building size={24} className="text-amber-500/50" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{tenant?.name || 'Carregando...'}</h1>
              {tenant?.address ? (
                <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1"><MapPin size={12} /> {tenant.address}</p>
              ) : (
                <p className="text-xs text-zinc-500 mt-1">Agendamento Online</p>
              )}
            </div>
          </div>
          {tenant?.description && (
            <p className="text-sm text-zinc-400 mt-4 leading-relaxed">{tenant.description}</p>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto p-6 space-y-6">
        {/* Steps indicator */}
        <div className="flex items-center gap-2">
          {stepsList.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${step === s ? 'bg-amber-500 text-white' : i < currentStepIndex ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>
                {i + 1}
              </div>
              {i < stepsList.length - 1 && <div className="flex-1 h-px bg-zinc-800" min-width="20px" />}
            </div>
          ))}
        </div>

        {/* Step 1: Barber */}
        {step === 'barber' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Escolha o profissional</h2>
            {!tenant && <p className="text-zinc-500 text-sm">Carregando profissionais...</p>}
            {tenant?.users?.map((barber: any) => (
              <button
                key={barber.id}
                onClick={() => { setSelectedBarber(barber); setStep('service') }}
                className="w-full text-left p-4 rounded-xl border border-zinc-800 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all bg-zinc-900 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden border border-zinc-700">
                  {barber.photo ? (
                    <img src={barber.photo} alt={barber.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} className="text-zinc-500" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-white">{barber.name}</p>
                  {barber.bio && <p className="text-xs text-zinc-400 mt-1">{barber.bio}</p>}
                </div>
              </button>
            ))}
            {tenant?.users?.length === 0 && (
              <p className="text-zinc-500 text-sm">Nenhum profissional disponível no momento.</p>
            )}
          </div>
        )}

        {/* Step 2: Service */}
        {step === 'service' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setStep('barber')} className="text-zinc-500 hover:text-white">←</button>
              <h2 className="text-lg font-bold text-white">Serviços com {selectedBarber?.name}</h2>
            </div>
            {selectedBarber?.services?.length === 0 && (
              <p className="text-zinc-500 text-sm">Este profissional não possui serviços cadastrados.</p>
            )}
            {selectedBarber?.services?.map((s: any) => (
              <button
                key={s.id}
                onClick={() => { setSelectedService(s); setStep('datetime') }}
                className="w-full text-left p-4 rounded-xl border border-zinc-800 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all bg-zinc-900"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {s.photos && s.photos.length > 0 ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={s.photos[0]} alt={s.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0 text-amber-500/50">
                        <Scissors size={20} />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-white">{s.name}</p>
                      <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
                        <Clock size={12} /> {s.duration} minutos
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-green-400">{formatCurrency(Number(s.price))}</span>
                </div>
                {s.photos && s.photos.length > 1 && (
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-2 snap-x">
                    {s.photos.slice(1).map((photo: string, i: number) => (
                      <img key={i} src={photo} alt="" className="w-16 h-16 rounded-md object-cover flex-shrink-0 snap-start border border-zinc-800" />
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Step 3: Date & Time */}
        {step === 'datetime' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setStep('service')} className="text-zinc-500 hover:text-white">←</button>
              <h2 className="text-lg font-bold text-white">Data e horário com {selectedBarber?.name}</h2>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-300">Data</label>
              <input
                type="date"
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-300 mb-3">Horários disponíveis</p>
              {slots.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center py-6">Nenhum horário disponível neste dia</p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2 text-sm rounded-lg border text-center transition-all ${selectedSlot === slot ? 'bg-amber-500 border-amber-500 text-white' : 'border-zinc-700 text-zinc-300 hover:border-amber-500/50 hover:bg-amber-500/10'}`}
                    >
                      {format(parseISO(slot), 'HH:mm')}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedSlot && (
              <Button className="w-full" onClick={() => setStep('info')}>
                Continuar
              </Button>
            )}
          </div>
        )}

        {/* Step 4: Info */}
        {step === 'info' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setStep('datetime')} className="text-zinc-500 hover:text-white">←</button>
              <h2 className="text-lg font-bold text-white">Seus dados</h2>
            </div>
            {/* Resumo */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-zinc-400">
                <User size={14} /> <span>Profissional: <strong className="text-white">{selectedBarber?.name}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <Scissors size={14} /> <span>{selectedService?.name}</span>
                <span className="ml-auto text-amber-400 font-bold">{formatCurrency(Number(selectedService?.price || 0))}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <Calendar size={14} />
                <span>{selectedSlot && format(parseISO(selectedSlot), "dd/MM 'às' HH:mm", { locale: ptBR })}</span>
              </div>
            </div>
            {user ? (
              <>
                <Button className="w-full" size="lg" isLoading={isLoading} onClick={handleBook}>
                  Confirmar agendamento
                </Button>
              </>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center space-y-4">
                <p className="text-zinc-300">Você precisa ter uma conta para agendar.</p>
                <div className="flex gap-2">
                  <Button className="flex-1" variant="secondary" onClick={() => navigate('/login')}>Fazer Login</Button>
                  <Button className="flex-1" onClick={() => navigate('/register')}>Criar Conta</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
