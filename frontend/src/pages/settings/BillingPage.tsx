import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { subscriptionService } from '../../services/subscriptionService'
import { adminService } from '../../services/adminService'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Card } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { CreditCard, CheckCircle, AlertTriangle } from 'lucide-react'

export default function BillingPage() {
  const queryClient = useQueryClient()

  const { data: mySubData, isLoading: loadingSub } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: () => subscriptionService.getMySubscription()
  })

  const { data: plans = [], isLoading: loadingPlans } = useQuery({
    queryKey: ['public-plans'],
    queryFn: () => adminService.getPlans()
  })

  const simulateMutation = useMutation({
    mutationFn: (plan_id: string) => subscriptionService.simulateSubscribe(plan_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-subscription'] })
    }
  })

  const subscription = mySubData?.subscription

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Assinatura & Faturamento</h1>

        {loadingSub ? (
          <p className="text-zinc-400">Carregando...</p>
        ) : (
          <Card>
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Status da sua conta</h2>
                  {subscription ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${subscription.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                          }`}>
                          {subscription.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}
                        </span>
                        <span className="text-zinc-300">Plano: {subscription.plan.name}</span>
                      </div>
                      <p className="text-sm text-zinc-400">
                        Próxima cobrança: {new Date(subscription.current_period_end).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-500">
                      <AlertTriangle className="w-5 h-5" />
                      <span>Você ainda não possui uma assinatura ativa.</span>
                    </div>
                  )}
                </div>
                <CreditCard className="w-10 h-10 text-zinc-600" />
              </div>
            </div>
          </Card>
        )}

        <h2 className="text-xl font-bold text-white mt-8 mb-4">Escolha um Plano</h2>
        <p className="text-zinc-400">Em breve...</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loadingPlans ? (
            <p className="text-zinc-400">Carregando planos...</p>
          ) : plans.map((plan: any) => (
            <Card key={plan.id} className="relative overflow-hidden">
              {subscription?.plan_id === plan.id && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                  Plano Atual
                </div>
              )}
              <div className="p-6 flex flex-col h-full">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="text-3xl font-black text-emerald-500 mb-6">
                  R$ {plan.price.toString().replace('.', ',')} <span className="text-sm font-normal text-zinc-500">/mês</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1 text-zinc-400 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Até {plan.max_barbers} barbeiro(s)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Página Pública Online
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Agendamentos Ilimitados
                  </li>
                </ul>
                <Button
                  variant={subscription?.plan_id === plan.id ? 'secondary' : 'primary'}
                  className="w-full"
                  disabled={simulateMutation.isPending || subscription?.plan_id === plan.id}
                  onClick={() => simulateMutation.mutate(plan.id)}
                >
                  {subscription?.plan_id === plan.id ? 'Plano Atual' : 'Assinar (Simular)'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
