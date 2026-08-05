import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Scissors, Clock, Calendar, CheckCircle } from 'lucide-react'
import { appointmentsService } from '../../services/appointmentsService'
import Button from '../../components/ui/Button'
import type { Service, Tenant } from '../../interfaces'
import Input from '../../components/ui/Input'
import { formatCurrency } from '../../utils'

type Step = 'service' | 'datetime' | 'info' | 'success'

export default function PublicBookingPage() {
  const slug = window.location.pathname.split('/')[2] // /booking/:slug
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [services] = useState<any[]>([])
  const [slots, setSlots] = useState<string[]>([])
  const [step, setStep] = useState<Step>('service')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', phone: '' })

  useEffect(() => {
    // Fetch tenant data e serviços
    appointmentsService.getPublicSlots(slug, selectedDate).catch(() => { })
    // Fetch services from public endpoint (reuse authenticated)
    // In production, create a dedicated public endpoint for tenant info
    setTenant({ id: '', name: 'Barbearia', slug })
  }, [slug])

  useEffect(() => {
    if (step === 'datetime') {
      appointmentsService.getPublicSlots(slug, selectedDate)
        .then((data) => setSlots(data))
        .catch(() => setSlots([]))
    }
  }, [selectedDate, step, slug])

  const handleBook = async () => {
    if (!selectedSlot || !selectedService) return
    setIsLoading(true)
    setError('')
    try {
      await appointmentsService.bookPublicAppointment(slug, {
        name: form.name,
        phone: form.phone,
        serviceId: selectedService.id,
        startDate: selectedSlot,
      })
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
            Seu agendamento foi confirmado para{' '}
            <span className="text-amber-400 font-semibold">
              {selectedSlot && format(parseISO(selectedSlot), "dd/MM 'às' HH:mm", { locale: ptBR })}
            </span>
          </p>
          <Button className="w-full" onClick={() => { setStep('service'); setSelectedSlot(null); setSelectedService(null) }}>
            Fazer outro agendamento
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-800 p-5">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center">
            <Scissors size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">{tenant?.name || 'Barbearia'}</h1>
            <p className="text-xs text-zinc-500">Agendamento Online</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-6 space-y-6">
        {/* Steps indicator */}
        <div className="flex items-center gap-2">
          {(['service', 'datetime', 'info'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${step === s ? 'bg-amber-500 text-white' : i < ['service', 'datetime', 'info'].indexOf(step) ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>
                {i + 1}
              </div>
              {i < 2 && <div className="flex-1 h-px bg-zinc-800" />}
            </div>
          ))}
        </div>

        {/* Step 1: Service */}
        {step === 'service' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Escolha o serviço</h2>
            {services.length === 0 && (
              <p className="text-zinc-500 text-sm">Carregando serviços...</p>
            )}
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => { setSelectedService(s); setStep('datetime') }}
                className="w-full text-left p-4 rounded-xl border border-zinc-800 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all bg-zinc-900"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{s.name}</p>
                    <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
                      <Clock size={12} /> {s.duration} minutos
                    </p>
                  </div>
                  <span className="font-semibold text-green-400">{formatCurrency(Number(s.price))}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 'datetime' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setStep('service')} className="text-zinc-500 hover:text-white">←</button>
              <h2 className="text-lg font-bold text-white">Escolha a data e horário</h2>
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

        {/* Step 3: Info */}
        {step === 'info' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setStep('datetime')} className="text-zinc-500 hover:text-white">←</button>
              <h2 className="text-lg font-bold text-white">Seus dados</h2>
            </div>
            {/* Resumo */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-zinc-400">
                <Scissors size={14} /> <span>{selectedService?.name}</span>
                <span className="ml-auto text-amber-400 font-bold">{formatCurrency(Number(selectedService?.price || 0))}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <Calendar size={14} />
                <span>{selectedSlot && format(parseISO(selectedSlot), "dd/MM 'às' HH:mm", { locale: ptBR })}</span>
              </div>
            </div>
            <Input id="pub-name" label="Seu nome *" placeholder="João Silva" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input id="pub-phone" label="WhatsApp *" placeholder="(11) 99999-9999" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button className="w-full" size="lg" isLoading={isLoading} onClick={handleBook} disabled={!form.name || !form.phone}>
              Confirmar agendamento
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
