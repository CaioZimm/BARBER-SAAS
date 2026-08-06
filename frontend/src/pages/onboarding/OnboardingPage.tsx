import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Store, MapPin, Phone, Info, ImagePlus, ArrowRight, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../../lib/axios'
import { tenantService } from '../../services/tenantService'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { applyPhoneMask } from '../../utils'
import { useAuth } from '../../hooks/useAuth'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState({
    name: '', slug: '', logo: '', description: '', phone: '', address: ''
  })

  const { data: tenant, isLoading: loadingTenant } = useQuery({
    queryKey: ['tenant'],
    queryFn: () => tenantService.getTenant(),
    enabled: !!user
  })

  useEffect(() => {
    if (tenant) {
      setForm({
        name: tenant.name || '',
        slug: tenant.slug || '',
        logo: tenant.logo || '',
        description: tenant.description || '',
        phone: tenant.phone || '',
        address: tenant.address || ''
      })
    }
  }, [tenant])

  const [isUploading, setIsUploading] = useState(false)
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setForm(f => ({ ...f, logo: res.data.url }))
      toast.success('Logo enviada!')
    } catch {
      toast.error('Erro ao enviar logo')
    } finally {
      setIsUploading(false)
    }
  }

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let value = e.target.value
    if (field === 'phone') value = applyPhoneMask(value)
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const updateMutation = useMutation({
    mutationFn: () => tenantService.updateTenant(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant'] })
      if (step === 1) {
        setStep(2)
      } else {
        toast.success('Barbearia configurada com sucesso!')
        navigate('/dashboard')
      }
    },
    onError: () => toast.error('Erro ao salvar as informações')
  })

  if (loadingTenant) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Carregando...</div>

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-96 bg-amber-500/10 blur-[100px] -z-10 rounded-full" />

      <div className="w-full max-w-2xl space-y-8 z-10">
        <div className="flex items-center gap-3 justify-center">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
            <Store size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-white">Configurar sua Barbearia</span>
        </div>

        {/* Progress Bar */}
        <div className="flex justify-center gap-2 mb-8">
          <div className={`h-1.5 w-16 rounded-full transition-colors ${step >= 1 ? 'bg-amber-500' : 'bg-zinc-800'}`} />
          <div className={`h-1.5 w-16 rounded-full transition-colors ${step >= 2 ? 'bg-amber-500' : 'bg-zinc-800'}`} />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden min-h-[500px]">
          <AnimatePresence mode="wait">

            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="space-y-1 text-center">
                  <h2 className="text-xl font-bold text-white">Identidade Visual</h2>
                  <p className="text-zinc-400 text-sm">Como os clientes verão seu negócio.</p>
                </div>

                <div className="space-y-6">
                  {/* Logo Upload */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center overflow-hidden relative group">
                      {form.logo ? (
                        <img src={form.logo} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <ImagePlus size={24} className="text-zinc-500" />
                      )}
                      <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center pointer-events-none">
                        <ImagePlus size={24} className="text-white" />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isUploading}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-zinc-300 font-medium">Logo da Barbearia</p>
                      <p className="text-xs text-zinc-500">{isUploading ? 'Enviando...' : 'Clique para alterar (Opcional)'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <Input id="name" label="Nome da Barbearia *" placeholder="Nome que aparecerá para os clientes"
                      value={form.name} onChange={handleChange('name')} leftIcon={<Store size={16} />} required />

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="description" className="text-sm font-medium text-zinc-300">Descrição (Opcional)</label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3 text-zinc-500 top-3">
                          <Info size={16} />
                        </div>
                        <textarea
                          id="description"
                          className="w-full rounded-lg border border-zinc-700 bg-zinc-900/50 pl-10 pr-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[100px] resize-none"
                          placeholder="Conte um pouco sobre a sua barbearia..."
                          value={form.description}
                          onChange={handleChange('description')}
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full flex items-center justify-center gap-2"
                    size="lg"
                    onClick={() => updateMutation.mutate()}
                    isLoading={updateMutation.isPending}
                    disabled={!form.name}
                  >
                    Próximo Passo <ArrowRight size={18} />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="space-y-1 text-center">
                  <h2 className="text-xl font-bold text-white">Contato e Localização</h2>
                  <p className="text-zinc-400 text-sm">Onde seus clientes te encontrarão.</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <Input id="phone" label="Telefone / WhatsApp *" placeholder="(00) 00000-0000"
                      value={form.phone} onChange={handleChange('phone')} leftIcon={<Phone size={16} />} required maxLength={15} />

                    <Input id="address" label="Endereço Completo (Opcional)" placeholder="Rua, Número, Bairro, Cidade"
                      value={form.address} onChange={handleChange('address')} leftIcon={<MapPin size={16} />} />
                  </div>

                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3 mt-4">
                    <CheckCircle2 className="text-amber-500 shrink-0" size={24} />
                    <div>
                      <p className="text-amber-400 font-semibold text-sm">Tudo quase pronto!</p>
                      <p className="text-zinc-400 text-xs mt-1">Após concluir, você poderá ajustar seus horários de funcionamento e adicionar sua equipe diretamente no painel.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="px-4">
                      Voltar
                    </Button>
                    <Button
                      className="flex-1 flex items-center justify-center gap-2"
                      size="lg"
                      onClick={() => updateMutation.mutate()}
                      isLoading={updateMutation.isPending}
                      disabled={form.phone.length < 14}
                    >
                      Ir para o Painel <ArrowRight size={18} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
