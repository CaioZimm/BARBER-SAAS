import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Scissors, User as UserIcon, Mail, Lock, Phone, ArrowRight, Store, CalendarClock } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { applyPhoneMask } from '../../utils'
import { motion, AnimatePresence } from 'framer-motion'

export default function RegisterPage() {
  const { register, registerClient } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<1 | 2>(1)
  const [role, setRole] = useState<'CLIENT' | 'BARBER' | null>(null)

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirm_password: '', tenantName: '', tenantSlug: '', tenantPhone: '', tenantAddress: '', tenantDescription: ''
  })

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let value = e.target.value
    if (field === 'phone') value = applyPhoneMask(value)
    if (field === 'tenantSlug') value = value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleNextStep = (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.name || !form.email || !form.phone || !form.password) {
      setError('Preencha todos os campos.')
      return
    }

    if (form.password.length < 4) {
      setError('Senha deve ter ao menos 4 caracteres.')
      return
    }

    if (form.password !== form.confirm_password) {
      setError('As senhas não coincidem.')
      return
    }

    if (form.phone.length < 14) {
      setError('Telefone inválido.')
      return
    }

    setStep(2)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!role) {
      setError('Selecione uma opção para continuar.')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      if (role === 'CLIENT') {
        await registerClient({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password
        })
        navigate('/explore')
      } else {
        await register({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          tenantName: form.tenantName,
          tenantSlug: form.tenantSlug,
          tenantPhone: form.tenantPhone,
          tenantAddress: form.tenantAddress,
          tenantDescription: form.tenantDescription
        })
        navigate('/onboarding')
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao criar conta.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-96 bg-amber-500/10 blur-[100px] -z-10 rounded-full" />

      <div className="w-full max-w-lg space-y-8 z-10">
        <div className="flex items-center gap-3 justify-center">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
            <Scissors size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-white">Barbearia App</span>
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
                <div className="space-y-1 lg:items-start flex items-center flex-col text-center">
                  <h2 className="text-xl font-bold text-white">Criar conta</h2>
                  <p className="text-zinc-400 text-sm">Preencha seus dados básicos para começar</p>
                </div>

                <form onSubmit={handleNextStep} className="space-y-4">
                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4">
                    <Input id="name" label="Nome" placeholder="João Silva"
                      value={form.name} onChange={handleChange('name')} leftIcon={<UserIcon size={16} />} required />
                    <Input id="email" type="email" label="Email" placeholder="joao@email.com"
                      value={form.email} onChange={handleChange('email')} leftIcon={<Mail size={16} />} required />
                    <Input id="phone" label="Celular (WhatsApp)" placeholder="(00) 00000-0000"
                      value={form.phone} onChange={handleChange('phone')} leftIcon={<Phone size={16} />} required maxLength={15} />

                    <div className="grid grid-cols-2 gap-4">
                      <Input id="password" type="password" label="Senha" placeholder="Mínimo 4 caracteres"
                        value={form.password} onChange={handleChange('password')} leftIcon={<Lock size={16} />} required />
                      <Input id="confirm_password" type="password" label="Confirmar Senha" placeholder="Repita a senha"
                        value={form.confirm_password} onChange={handleChange('confirm_password')} leftIcon={<Lock size={16} />} required />
                    </div>
                  </div>

                  <Button type="submit" className="w-full flex items-center justify-center gap-2" size="lg">
                    Continuar <ArrowRight size={18} />
                  </Button>
                </form>

                <p className="text-center text-sm text-zinc-500">
                  Já tem conta?{' '}
                  <Link to="/login" className="text-amber-400 hover:text-amber-300 font-medium underline">
                    Fazer login
                  </Link>
                </p>
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
                  <h2 className="text-xl font-bold text-white">O que você busca?</h2>
                  <p className="text-zinc-400 text-sm">Escolha como deseja usar a plataforma</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3">
                    {/* Role CLIENT */}
                    <button
                      type="button"
                      onClick={() => setRole('CLIENT')}
                      className={`p-4 rounded-xl border flex items-start gap-4 transition-all text-left ${role === 'CLIENT' ? 'bg-amber-500/10 border-amber-500/50' : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
                        }`}
                    >
                      <div className={`p-3 rounded-lg ${role === 'CLIENT' ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
                        <CalendarClock size={24} />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${role === 'CLIENT' ? 'text-amber-400' : 'text-white'}`}>Explorar barbearias</h3>
                        <p className="text-sm text-zinc-400 mt-1">Quero explorar barbearias e agendar meus cortes de cabelo e barba.</p>
                      </div>
                    </button>

                    {/* Role BARBER */}
                    <button
                      type="button"
                      onClick={() => {
                        setRole('BARBER');
                        if (!form.tenantName) {
                          setForm(f => ({ ...f, tenantName: `Barbearia do ${f.name.split(' ')[0]}` }));
                          setForm(f => ({ ...f, tenantSlug: `barbearia-do-${f.name.split(' ')[0].toLowerCase()}` }));
                        }
                      }}
                      className={`p-4 rounded-xl border flex items-start gap-4 transition-all text-left ${role === 'BARBER' ? 'bg-amber-500/10 border-amber-500/50' : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
                        }`}
                    >
                      <div className={`p-3 rounded-lg ${role === 'BARBER' ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
                        <Store size={24} />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${role === 'BARBER' ? 'text-amber-400' : 'text-white'}`}>Gerenciar minha Barbearia</h3>
                        <p className="text-sm text-zinc-400 mt-1">Sou dono de barbearia ou barbeiro e quero usar o sistema para gerenciar tudo.</p>
                      </div>
                    </button>
                  </div>

                  {/* Extra fields if BARBER */}
                  {role === 'BARBER' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4 pt-4 border-t border-zinc-800"
                    >
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Nome do seu negócio</p>
                      <Input id="tenantName" label="Nome da barbearia *" placeholder="Barbearia do João"
                        value={form.tenantName} onChange={handleChange('tenantName')} required />
                      <Input id="tenantSlug" label="Link público *" placeholder="barbearia-do-joao"
                        value={form.tenantSlug} onChange={handleChange('tenantSlug')} required />
                      {form.tenantSlug && (
                        <p className="text-xs text-zinc-500 -mt-2">
                          Seu link: <span className="text-amber-400">barbersaas.com/booking/{form.tenantSlug}</span>
                        </p>
                      )}

                      <Input id="tenantPhone" label="Telefone / WhatsApp da Barbearia" placeholder="(00) 00000-0000"
                        value={form.tenantPhone} onChange={(e) => {
                          const val = applyPhoneMask(e.target.value)
                          setForm((prev) => ({ ...prev, tenantPhone: val }))
                        }} maxLength={15} />
                      <Input id="tenantAddress" label="Endereço" placeholder="Rua, Número, Bairro, Cidade"
                        value={form.tenantAddress} onChange={handleChange('tenantAddress')} />

                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="tenantDescription" className="text-sm font-medium text-zinc-300">Descrição (Opcional)</label>
                        <textarea
                          id="tenantDescription"
                          className="w-full rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[80px] resize-none"
                          placeholder="Conte um pouco sobre a sua barbearia..."
                          value={form.tenantDescription}
                          onChange={handleChange('tenantDescription')}
                        />
                      </div>
                    </motion.div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="px-4">
                      Voltar
                    </Button>
                    <Button type="submit" className="flex-1" size="lg" isLoading={isLoading}>
                      {role === 'BARBER' ? 'Criar Barbearia' : role === 'CLIENT' ? 'Acessar o sistema' : 'Concluir Cadastro'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  )
}
