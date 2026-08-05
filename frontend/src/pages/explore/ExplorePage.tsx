import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Search, Scissors, MapPin, Clock, ChevronRight, Sparkles } from 'lucide-react'
import { publicService } from '../../services/publicService'
import type { Barbershop } from '../../interfaces'
import { formatCurrency } from '../../utils'
import Input from '../../components/ui/Input'

function getMinPrice(services: { price: string | number }[]) {
  if (!services.length) return null
  return Math.min(...services.map((s) => Number(s.price)))
}

function getAvatar(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

const GRADIENT_PAIRS = [
  ['from-amber-500/20', 'to-orange-500/5'],
  ['from-purple-500/20', 'to-indigo-500/5'],
  ['from-emerald-500/20', 'to-teal-500/5'],
  ['from-rose-500/20', 'to-pink-500/5'],
  ['from-sky-500/20', 'to-blue-500/5'],
  ['from-violet-500/20', 'to-purple-500/5'],
]

export default function ExplorePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const { data: barbershops = [], isLoading } = useQuery<Barbershop[]>({
    queryKey: ['public-barbershops', search],
    queryFn: () =>
      publicService.getBarbershops(search),
  })

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent" />
        <div className="relative max-w-5xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-6">
            <Sparkles size={14} className="text-amber-400" />
            <span className="text-amber-400 text-xs font-medium">Encontre a barbearia perfeita</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
            Seu próximo corte está<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
              a um clique de distância
            </span>
          </h1>
          <p className="mt-4 text-zinc-400 text-lg max-w-xl mx-auto">
            Explore as melhores barbearias, confira preços e serviços, e agende sem sair de casa.
          </p>

          {/* Search */}
          <div className="mt-8 max-w-md mx-auto">
            <Input
              id="search-barbershops"
              placeholder="Buscar barbearia por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search size={16} />}
              className="bg-zinc-900/80 backdrop-blur-sm border-zinc-700 text-base py-3"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : barbershops.length === 0 ? (
          <div className="text-center py-20">
            <Scissors size={48} className="text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg font-medium">Nenhuma barbearia encontrada</p>
            <p className="text-zinc-600 text-sm mt-1">Tente buscar por outro nome</p>
          </div>
        ) : (
          <>
            <p className="text-zinc-500 text-sm mb-6">
              {barbershops.length} barbearia{barbershops.length !== 1 ? 's' : ''} disponível{barbershops.length !== 1 ? 'eis' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {barbershops.map((shop, i) => {
                const [from, to] = GRADIENT_PAIRS[i % GRADIENT_PAIRS.length]!
                const minPrice = getMinPrice(shop.services)
                return (
                  <button
                    key={shop.id}
                    onClick={() => navigate(`/barbearia/${shop.slug}`)}
                    className="group text-left rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden hover:border-zinc-600 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    {/* Card header gradient */}
                    <div className={`h-24 bg-gradient-to-br ${from} ${to} flex items-center justify-center relative`}>
                      <div className="w-14 h-14 rounded-2xl bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {getAvatar(shop.name)}
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors leading-tight">
                            {shop.name}
                          </h3>
                          <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                            <MapPin size={11} /> @{shop.slug}
                          </p>
                        </div>
                        <ChevronRight size={18} className="text-zinc-600 group-hover:text-amber-400 transition-colors shrink-0 mt-0.5" />
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-zinc-400">
                          <Scissors size={12} className="text-amber-400" />
                          {shop._count?.services || 0} serviço{shop._count?.services !== 1 ? 's' : ''}
                        </span>
                        {minPrice !== null && (
                          <span className="flex items-center gap-1 text-zinc-400">
                            <span className="text-green-400 font-semibold">
                              <span className="font-semibold">{formatCurrency(Number(minPrice))}</span>
                            </span>
                          </span>
                        )}
                      </div>

                      <div className="pt-1">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1">
                          <Clock size={11} /> Agendar agora
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Footer CTA */}
      <div className="border-t border-zinc-800 py-8 text-center">
        <p className="text-zinc-600 text-sm">
          Você é barbeiro?{' '}
          <a href="/register" className="text-amber-400 hover:text-amber-300 font-medium">
            Cadastre sua barbearia grátis →
          </a>
        </p>
      </div>
    </div>
  )
}
