import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Scissors, Mail, Lock } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-zinc-900 to-zinc-950 p-12 border-r border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center">
            <Scissors size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">Barbearia</span>
        </div>

        <div className="space-y-6">
          <blockquote className="space-y-3">
            <p className="text-2xl font-medium text-white leading-snug">
              "Gerencie sua barbearia com <span className="text-amber-400">profissionalismo</span> e foco no que mais importa: o seu cliente."
            </p>
          </blockquote>
          <div className="flex gap-4">
            {[
              { value: '100%', label: 'Online' },
              { value: '24h', label: 'Disponível' },
              { value: '0', label: 'Conflitos' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-amber-400">{value}</div>
                <div className="text-xs text-zinc-500">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-zinc-600 text-sm">© 2026 SaaS. Todos os direitos reservados.</p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-2">
            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center">
              <Scissors size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">Barbearia</span>
          </div>

          <div className="space-y-2 lg:space-y-0 flex flex-col items-center justify-center mt-4 lg:items-start">
            <h2 className="text-2xl font-bold text-white">Bem-vindo!</h2>
            <p className="text-zinc-400 text-sm">Entre na sua conta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={16} />}
              required
              autoComplete="email"
            />

            <Input
              id="password"
              type="password"
              label="Senha"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
              required
              autoComplete="current-password"
            />

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Entrar
            </Button>
          </form>

          <p className="text-center text-sm text-zinc-500">
            Não tem conta?{' '}
            <Link to="/register" className="text-amber-400 hover:text-amber-300 font-medium underline">
              Cadastre-se grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
