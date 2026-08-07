import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Scissors, Clock, MapPin } from 'lucide-react'
import { publicService } from '../../services/publicService'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import type { Barbershop } from '../../interfaces'
import { formatCurrency } from '../../utils'

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function BarbershopPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  // Fetch barbershop profile
  const { data: shop, isLoading, isError } = useQuery<Barbershop>({
    queryKey: ['barbershop', slug],
    queryFn: () => publicService.getBarbershopBySlug(slug!),
    enabled: !!slug,
  })

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

  const handleBookClick = () => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }
    navigate(`/booking/${slug}`)
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/explore')}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-white truncate">{shop.name}</h1>
            <p className="text-xs text-zinc-500 flex items-center gap-1 truncate">
              <MapPin size={10} shrink-0 /> {(shop as any).address ? (shop as any).address : `@${shop.slug}`}
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
            <Scissors size={14} className="text-white" />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-12">
        <div className="space-y-8 pt-6">
          {/* Hero card */}
          <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-amber-500/10 to-zinc-900 p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-bold text-2xl shrink-0 overflow-hidden">
                {(shop as any).logo ? (
                  <img src={(shop as any).logo} alt={shop.name} className="w-full h-full object-cover" />
                ) : (
                  shop.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{shop.name}</h2>
                <p className="text-sm text-zinc-400 mt-0.5 flex items-center gap-1.5">
                  {shop.services.length} serviço{shop.services.length !== 1 ? 's' : ''} disponível{shop.services.length !== 1 ? 'eis' : ''}
                </p>
              </div>
            </div>
            {(shop as any).description && (
              <p className="mt-4 text-sm text-zinc-300 leading-relaxed border-t border-zinc-800/50 pt-4">
                {(shop as any).description}
              </p>
            )}
          </div>

          <Button className="w-full" size="lg" onClick={handleBookClick}>
            Fazer Agendamento
          </Button>

          {/* Services */}
          <section>
            <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
              <Scissors size={16} className="text-amber-400" /> Serviços e Preços
            </h3>
            <div className="space-y-2">
              {shop.services.map((service) => (
                <div
                  key={service.id}
                  className="w-full text-left flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <Scissors size={16} className="text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">
                      {service.name}
                    </p>
                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                      <Clock size={11} /> {service.duration} minutos
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-semibold text-green-400">{formatCurrency(Number(service.price))}</span>
                  </div>
                </div>
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
      </div>

      <Modal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} title="Login necessário">
        <div className="space-y-4">
          <p className="text-zinc-300">Você precisa ter uma conta para fazer um agendamento.</p>
          <div className="flex gap-2">
            <Button className="flex-1" variant="secondary" onClick={() => navigate(`/login?returnTo=/booking/${slug}`)}>Fazer Login</Button>
            <Button className="flex-1" onClick={() => navigate(`/register?returnTo=/booking/${slug}`)}>Criar Conta</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
