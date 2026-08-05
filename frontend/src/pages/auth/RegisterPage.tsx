import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Scissors, User, Mail, Lock, Store, AtSign } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm_password: '', tenantName: '', tenantSlug: '',
  })

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    if (field === 'tenantSlug') value = value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const dataToSend = { ...form }
      delete (dataToSend as any).confirm_password
      await register(dataToSend)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao criar conta.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-8">
        <div className="flex items-center gap-3 justify-center">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
            <Scissors size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-white">Barbearia</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">
          <div className="space-y-1 lg:items-start flex items-center flex-col">
            <h2 className="text-xl font-bold text-white">Criar sua conta</h2>
            <p className="text-zinc-400 text-sm">Configure sua barbearia em minutos</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Dados Pessoais</p>
              <Input id="name" label="Seu nome" placeholder="João Silva"
                value={form.name} onChange={handleChange('name')} leftIcon={<User size={16} />} required />
              <Input id="email" type="email" label="Email" placeholder="joao@email.com"
                value={form.email} onChange={handleChange('email')} leftIcon={<Mail size={16} />} required />
              <Input id="password" type="password" label="Senha" placeholder="Mínimo 8 caracteres"
                value={form.password} onChange={handleChange('password')} leftIcon={<Lock size={16} />} required />
              <Input id="confirm_password" type="password" label="Confirmar Senha" placeholder="Digite a senha novamente"
                value={form.confirm_password} onChange={handleChange('confirm_password')} leftIcon={<Lock size={16} />} required />

              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider pt-2">Sua barbearia</p>
              <Input id="tenantName" label="Nome da barbearia" placeholder="Barbearia do João"
                value={form.tenantName} onChange={handleChange('tenantName')} leftIcon={<Store size={16} />} required />
              <Input id="tenantSlug" label="Link público" placeholder="barbearia-do-joao"
                value={form.tenantSlug} onChange={handleChange('tenantSlug')} leftIcon={<AtSign size={16} />}
                required
              />
              {form.tenantSlug && (
                <p className="text-xs text-zinc-500 -mt-2">
                  Seu link: <span className="text-amber-400">barbersaas.com/{form.tenantSlug}</span>
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Criar conta
            </Button>
          </form>

          <p className="text-center text-sm text-zinc-500">
            Já tem conta?{' '}
            <Link to="/login" className="text-amber-400 hover:text-amber-300 font-medium underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
