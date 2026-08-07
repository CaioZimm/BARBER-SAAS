import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Clock, MapPin, Scissors, LogOut, User, Save } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { appointmentsService } from '../../services/appointmentsService'
import { authService } from '../../services/authService'
import { useAuth } from '../../hooks/useAuth'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { applyPhoneMask } from '../../utils'
import api from '../../lib/axios'
import toast from 'react-hot-toast'
import StatusBadge from '../../components/ui/StatusBadge'

export default function MyAppointmentsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, logout } = useAuth()

  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '', photo: '', password: '' })
  const [isUploading, setIsUploading] = useState(false)

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['my-appointments'],
    queryFn: () => appointmentsService.getAppointments(),
  })

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', email: user.email || '', phone: user.phone || '', photo: user.photo || '', password: '' })
    }
  }, [user])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setProfileForm(f => ({ ...f, photo: res.data.url }))
      toast.success('Foto atualizada!')
    } catch {
      toast.error('Erro ao enviar foto')
    } finally {
      setIsUploading(false)
    }
  }

  const updateProfileMutation = useMutation({
    mutationFn: () => authService.updateProfile(profileForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      setProfileForm(f => ({ ...f, password: '' }))
      setProfileModalOpen(false)
      alert('Perfil atualizado com sucesso!')
    },
    onError: (err: any) => alert(err.response?.data?.error || 'Erro ao atualizar perfil')
  })

  const cancelAppointmentMutation = useMutation({
    mutationFn: (id: string) => appointmentsService.cancelAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] })
      toast.success('Agendamento cancelado com sucesso!')
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Erro ao cancelar agendamento')
  })

  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/explore')} className="text-zinc-400 hover:text-white transition-colors">
              ← Explorar
            </button>
            <div className="flex items-center gap-2 font-bold text-white">
              Meus Agendamentos
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setProfileModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                {user?.photo ? (
                  <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={14} className="text-zinc-400" />
                )}
              </div>
              <span className="text-sm font-medium text-white">{user?.name}</span>
            </button>
            <button onClick={logout} className="p-2 text-zinc-400 hover:text-red-400 transition-colors" title="Sair">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : appointments?.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <Calendar size={48} className="text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg font-medium">Nenhum agendamento encontrado</p>
            <button onClick={() => navigate('/explore')} className="mt-4 text-amber-500 hover:text-amber-400 transition-colors">
              Encontrar uma barbearia
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {appointments?.map((apt: any) => {
              const date = parseISO(apt.start_date)
              const isPast = date < new Date()
              const hasFutureAppointmentForTenant = appointments.some((a: any) => a.tenant.id === apt.tenant.id && a.status === 'SCHEDULED' && parseISO(a.start_date) > new Date())
              return (
                <div key={apt.id} className={`p-6 rounded-2xl border ${isPast ? 'border-zinc-800' : 'border-amber-500'}`}>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{apt.tenant.name}</h3>
                      <p className="text-zinc-400 text-sm flex items-center gap-1 mt-1">
                        <MapPin size={14} /> barbearia/{apt.tenant.slug}
                      </p>
                    </div>
                    <div className="self-start sm:self-auto flex items-center gap-3">
                      <StatusBadge status={apt.status} />
                      {apt.status === 'SCHEDULED' && !isPast && (
                        <button
                          onClick={() => {
                            if (window.confirm('Deseja realmente cancelar este agendamento?')) {
                              cancelAppointmentMutation.mutate(apt.id)
                            }
                          }}
                          disabled={cancelAppointmentMutation.isPending}
                          className="text-xs text-red-400 hover:text-red-300 border border-red-400/20 px-3 py-1 rounded-full transition-colors disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      )}
                      {apt.status === 'CANCELED' && !hasFutureAppointmentForTenant && (
                        <button
                          onClick={() => navigate(`/booking/${apt.tenant.slug}`)}
                          className="text-xs text-amber-400 hover:text-amber-300 border border-amber-400/20 bg-amber-400/10 px-3 py-1 rounded-full transition-colors"
                        >
                          Reagendar
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4 border-t border-zinc-800 pt-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                        <Scissors size={18} className="text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Serviço</p>
                        <p className="text-sm font-medium text-zinc-200">{apt.service.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Clock size={18} className="text-amber-500" />
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Horário</p>
                        <p className="text-sm font-medium text-amber-400">
                          {format(date, "dd MMM 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden">
                        {apt.user.photo ? (
                          <img src={apt.user.photo} alt={apt.user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-zinc-400 text-xs font-bold">{apt.user.name.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Profissional</p>
                        <p className="text-sm font-medium text-zinc-200">{apt.user.name}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Modal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} title="Meu Perfil">
        <div className="space-y-4 pt-2">
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center overflow-hidden relative group">
              {profileForm.photo ? (
                <img src={profileForm.photo} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={24} className="text-zinc-500" />
              )}
              <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center pointer-events-none">
                <User size={20} className="text-white" />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />
            </div>
            <p className="text-xs text-zinc-500">{isUploading ? 'Enviando...' : 'Alterar foto'}</p>
          </div>

          <Input
            label="Nome"
            value={profileForm.name}
            onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="E-mail"
            type="email"
            value={profileForm.email}
            onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))}
          />
          <Input
            label="Telefone / WhatsApp"
            value={profileForm.phone}
            onChange={e => setProfileForm(f => ({ ...f, phone: applyPhoneMask(e.target.value) }))}
            maxLength={15}
          />
          <Input
            label="Nova Senha (opcional)"
            type="password"
            placeholder="Deixe em branco para não alterar"
            value={profileForm.password}
            onChange={e => setProfileForm(f => ({ ...f, password: e.target.value }))}
          />

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-zinc-800">
            <Button variant="secondary" onClick={() => setProfileModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => updateProfileMutation.mutate()} disabled={updateProfileMutation.isPending}>
              <Save size={18} />
              {updateProfileMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
