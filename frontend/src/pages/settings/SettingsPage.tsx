import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, Calendar, Plus, Trash2, Save, User as UserIcon, Building } from 'lucide-react'
import { scheduleService } from '../../services/scheduleService'
import { authService } from '../../services/authService'
import { tenantService } from '../../services/tenantService'
import api from '../../lib/axios'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import type { WorkingHour, BlockedSchedule, Tenant, User } from '../../interfaces'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Card } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { applyPhoneMask } from '../../utils'

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState<'profile' | 'tenant' | 'schedule'>('profile')

  // Profile State
  const [profileForm, setProfileForm] = useState({ name: '', email: '', bio: '', phone: '', photo: '', password: '' })
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  // Tenant State
  const [tenantForm, setTenantForm] = useState({ name: '', slug: '' })

  // Schedule State
  const [blockModalOpen, setBlockModalOpen] = useState(false)
  const [blockForm, setBlockForm] = useState({ startDate: '', endDate: '', reason: '' })
  const [editingDay, setEditingDay] = useState<WorkingHour | null>(null)
  const [dayForm, setDayForm] = useState({ startTime: '09:00', endTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00', active: true })

  // Queries
  const { data: currentUser } = useQuery<User>({
    queryKey: ['me'],
    queryFn: () => authService.me(),
  })

  const { data: currentTenant } = useQuery<Tenant>({
    queryKey: ['tenant'],
    queryFn: () => tenantService.getTenant(),
    enabled: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN',
  })

  const { data: workingHours = [] } = useQuery<WorkingHour[]>({
    queryKey: ['working-hours'],
    queryFn: () => scheduleService.getWorkingHours(),
  })

  const { data: blocked = [] } = useQuery<BlockedSchedule[]>({
    queryKey: ['blocked'],
    queryFn: () => scheduleService.getBlockedTimes(),
  })

  // Effects
  useEffect(() => {
    if (currentUser) {
      setProfileForm({ name: currentUser.name, email: currentUser.email, bio: currentUser.bio || '', phone: currentUser.phone || '', photo: currentUser.photo || '', password: '' })
    }
  }, [currentUser])

  useEffect(() => {
    if (currentTenant) {
      setTenantForm({ name: currentTenant.name, slug: currentTenant.slug })
    }
  }, [currentTenant])

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: () => authService.updateProfile(profileForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      setProfileForm(f => ({ ...f, password: '' }))
      alert('Perfil atualizado com sucesso!')
    },
    onError: (err: any) => alert(err.response?.data?.error || 'Erro ao atualizar perfil')
  })

  const updateTenantMutation = useMutation({
    mutationFn: () => tenantService.updateTenant(tenantForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant'] })
      alert('Informações da barbearia atualizadas!')
    },
    onError: (err: any) => alert(err.response?.data?.error || 'Erro ao atualizar barbearia')
  })

  const saveHoursMutation = useMutation({
    mutationFn: () =>
      scheduleService.updateWorkingHours({
        dayOfWeek: editingDay!.day_of_week,
        startTime: dayForm.startTime,
        endTime: dayForm.endTime,
        lunchStart: dayForm.lunchStart || undefined,
        lunchEnd: dayForm.lunchEnd || undefined,
        active: dayForm.active,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['working-hours'] })
      setEditingDay(null)
    },
  })

  const addDayMutation = useMutation({
    mutationFn: (dayOfWeek: number) =>
      scheduleService.updateWorkingHours({
        dayOfWeek,
        startTime: '09:00',
        endTime: '18:00',
        lunchStart: '12:00',
        lunchEnd: '13:00',
        active: true,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['working-hours'] }),
  })

  const blockMutation = useMutation({
    mutationFn: () =>
      scheduleService.createBlockedTime({
        startDate: new Date(blockForm.startDate).toISOString(),
        endDate: new Date(blockForm.endDate).toISOString(),
        reason: blockForm.reason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked'] })
      setBlockModalOpen(false)
      setBlockForm({ startDate: '', endDate: '', reason: '' })
    },
  })

  const deleteBlockMutation = useMutation({
    mutationFn: (id: string) => scheduleService.deleteBlockedTime(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blocked'] }),
  })

  const openEditDay = (wh: WorkingHour) => {
    setEditingDay(wh)
    setDayForm({
      startTime: wh.start_time,
      endTime: wh.end_time,
      lunchStart: wh.lunch_start || '12:00',
      lunchEnd: wh.lunch_end || '13:00',
      active: wh.active,
    })
  }

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-white">Configurações</h1>
          <p className="text-zinc-400 text-sm mt-1">Gerencie seu perfil, barbearia e horários</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-zinc-800 pb-1">
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'profile' ? 'border-amber-500 text-amber-500' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
            onClick={() => setActiveTab('profile')}
          >
            <div className="flex items-center gap-2"><UserIcon size={16} /> Meu Perfil</div>
          </button>
          {isAdmin && (
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'tenant' ? 'border-amber-500 text-amber-500' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
              onClick={() => setActiveTab('tenant')}
            >
              <div className="flex items-center gap-2"><Building size={16} /> Barbearia</div>
            </button>
          )}
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'schedule' ? 'border-amber-500 text-amber-500' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
            onClick={() => setActiveTab('schedule')}
          >
            <div className="flex items-center gap-2"><Clock size={16} /> Horários</div>
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <Card className="space-y-4">
              <div className="flex flex-col items-center gap-2 mb-4">
                <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center overflow-hidden relative group">
                  {profileForm.photo ? (
                    <img src={profileForm.photo} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={32} className="text-zinc-500" />
                  )}
                  <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center pointer-events-none">
                    <UserIcon size={24} className="text-white" />
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      setIsUploadingPhoto(true)
                      try {
                        const formData = new FormData()
                        formData.append('file', file)
                        const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                        setProfileForm(f => ({ ...f, photo: res.data.url }))
                        toast.success('Foto atualizada!')
                      } catch {
                        toast.error('Erro ao enviar foto')
                      } finally {
                        setIsUploadingPhoto(false)
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploadingPhoto}
                  />
                </div>
                <p className="text-xs text-zinc-500">{isUploadingPhoto ? 'Enviando...' : 'Alterar foto de perfil'}</p>
              </div>

              <Input label="Nome" value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} />
              <Input label="E-mail" type="email" value={profileForm.email} onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))} />
              <Input label="Telefone / WhatsApp" value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: applyPhoneMask(e.target.value) }))} maxLength={15} />
              <div>
                <label className="text-sm font-medium text-zinc-300">Biografia (opcional)</label>
                <textarea
                  className="w-full mt-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none h-24"
                  value={profileForm.bio}
                  onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))}
                />
              </div>
              <Input label="Nova senha (deixe em branco para não alterar)" type="password" value={profileForm.password} onChange={e => setProfileForm(f => ({ ...f, password: e.target.value }))} />

              <div className="pt-2">
                <Button isLoading={updateProfileMutation.isPending} onClick={() => updateProfileMutation.mutate()}>Salvar Perfil</Button>
              </div>
            </Card>
          </div>
        )}

        {/* Tenant Tab */}
        {activeTab === 'tenant' && isAdmin && (
          <div className="space-y-6">
            <Card className="space-y-4">
              <Input label="Nome da Barbearia" value={tenantForm.name} onChange={e => setTenantForm(f => ({ ...f, name: e.target.value }))} />
              <Input label="Link Público (Slug)" value={tenantForm.slug} onChange={e => setTenantForm(f => ({ ...f, slug: e.target.value }))} />
              <p className="text-xs text-zinc-500 mt-1">Seu link será: app.barbersaas.com/booking/{tenantForm.slug || 'seuslug'}</p>

              <div className="pt-2">
                <Button isLoading={updateTenantMutation.isPending} onClick={() => updateTenantMutation.mutate()}>Salvar Barbearia</Button>
              </div>
            </Card>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-8">
            <section>
              <Card className="divide-y divide-zinc-800 p-0 overflow-hidden">
                {DAYS.map((day, i) => {
                  const wh = workingHours.find((w) => w.day_of_week === i)
                  return (
                    <div key={day} className="flex items-center gap-4 p-4">
                      <div className="w-24 shrink-0">
                        <p className="text-sm font-medium text-zinc-300">{day}</p>
                      </div>
                      {wh ? (
                        <>
                          <div className="flex-1 flex items-center gap-2 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${wh.active ? 'bg-green-500/10 text-green-400' : 'bg-zinc-700 text-zinc-500'}`}>
                              {wh.active ? 'Aberto' : 'Fechado'}
                            </span>
                            {wh.active && (
                              <span className="text-sm text-zinc-400">
                                {wh.start_time} — {wh.end_time}
                                {wh.lunch_start && ` (almoço: ${wh.lunch_start}–${wh.lunch_end})`}
                              </span>
                            )}
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => openEditDay(wh)}>Editar</Button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-sm text-zinc-600">Não configurado</span>
                          <Button size="sm" variant="secondary" onClick={() => addDayMutation.mutate(i)}>
                            <Plus size={14} /> Adicionar
                          </Button>
                        </>
                      )}
                    </div>
                  )
                })}
              </Card>
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Calendar size={18} className="text-amber-400" /> Bloqueios e Férias
                </h2>
                <Button size="sm" onClick={() => setBlockModalOpen(true)}>
                  <Plus size={14} /> Novo bloqueio
                </Button>
              </div>
              {blocked.length === 0 ? (
                <Card>
                  <p className="text-center text-zinc-500 text-sm py-4">Nenhum bloqueio cadastrado</p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {blocked.map((b) => (
                    <Card key={b.id} className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">
                          {format(new Date(b.start_date), 'dd MMM', { locale: ptBR })} — {format(new Date(b.end_date), 'dd MMM yyyy', { locale: ptBR })}
                        </p>
                        {b.reason && <p className="text-xs text-zinc-500 mt-0.5">{b.reason}</p>}
                      </div>
                      <button
                        onClick={() => deleteBlockMutation.mutate(b.id)}
                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-md transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Edit Day Modal */}
        {editingDay && (
          <Modal isOpen={!!editingDay} onClose={() => setEditingDay(null)} title={`Editar: ${DAYS[editingDay.day_of_week]}`}>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input type="checkbox" id="day-active" checked={dayForm.active} onChange={(e) => setDayForm((f) => ({ ...f, active: e.target.checked }))} className="w-4 h-4 accent-amber-500" />
                <label htmlFor="day-active" className="text-sm text-zinc-300">Dia ativo (aberto para atendimento)</label>
              </div>
              {dayForm.active && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Input id="start-time" type="time" label="Abertura" value={dayForm.startTime} onChange={(e) => setDayForm((f) => ({ ...f, startTime: e.target.value }))} />
                    <Input id="end-time" type="time" label="Fechamento" value={dayForm.endTime} onChange={(e) => setDayForm((f) => ({ ...f, endTime: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input id="lunch-start" type="time" label="Início do almoço" value={dayForm.lunchStart} onChange={(e) => setDayForm((f) => ({ ...f, lunchStart: e.target.value }))} />
                    <Input id="lunch-end" type="time" label="Fim do almoço" value={dayForm.lunchEnd} onChange={(e) => setDayForm((f) => ({ ...f, lunchEnd: e.target.value }))} />
                  </div>
                </>
              )}
              <div className="flex gap-3 pt-2">
                <Button variant="secondary" className="flex-1" onClick={() => setEditingDay(null)}>Cancelar</Button>
                <Button className="flex-1" isLoading={saveHoursMutation.isPending} onClick={() => saveHoursMutation.mutate()}>
                  <Save size={14} /> Salvar
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Block Modal */}
        <Modal isOpen={blockModalOpen} onClose={() => setBlockModalOpen(false)} title="Novo bloqueio">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input id="block-start" type="datetime-local" label="Início *" value={blockForm.startDate} onChange={(e) => setBlockForm((f) => ({ ...f, startDate: e.target.value }))} />
              <Input id="block-end" type="datetime-local" label="Fim *" value={blockForm.endDate} onChange={(e) => setBlockForm((f) => ({ ...f, endDate: e.target.value }))} />
            </div>
            <Input id="block-reason" label="Motivo" placeholder="Ex: Férias, consulta médica..." value={blockForm.reason} onChange={(e) => setBlockForm((f) => ({ ...f, reason: e.target.value }))} />
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" className="flex-1" onClick={() => setBlockModalOpen(false)}>Cancelar</Button>
              <Button className="flex-1" isLoading={blockMutation.isPending} onClick={() => blockMutation.mutate()}>Salvar</Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
