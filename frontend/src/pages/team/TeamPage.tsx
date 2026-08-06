import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeeService } from '../../services/employeeService'
import { barberServicesService } from '../../services/barberServicesService'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Card } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Users, UserPlus, Scissors } from 'lucide-react'

export default function TeamPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<any>(null)
  
  // Form State
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    commission_rate: '',
    bio: '',
    is_active_barber: true,
    service_ids: [] as string[]
  })

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.list()
  })

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => barberServicesService.getServices()
  })

  const mutation = useMutation({
    mutationFn: (data: any) => editingEmployee 
      ? employeeService.update(editingEmployee.id, data) 
      : employeeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      closeModal()
    }
  })

  const openModal = (employee?: any) => {
    if (employee) {
      setEditingEmployee(employee)
      setForm({
        name: employee.name,
        email: employee.email,
        password: '',
        commission_rate: employee.commission_rate?.toString() || '',
        bio: employee.bio || '',
        is_active_barber: employee.is_active_barber,
        service_ids: employee.services.map((s: any) => s.id)
      })
    } else {
      setEditingEmployee(null)
      setForm({
        name: '', email: '', password: '', commission_rate: '', bio: '', is_active_barber: true, service_ids: []
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingEmployee(null)
  }

  const toggleService = (serviceId: string) => {
    setForm(prev => {
      const isSelected = prev.service_ids.includes(serviceId)
      return {
        ...prev,
        service_ids: isSelected 
          ? prev.service_ids.filter(id => id !== serviceId)
          : [...prev.service_ids, serviceId]
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(form)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Equipe de Barbeiros</h1>
          <Button onClick={() => openModal()} className="flex items-center gap-2">
            <UserPlus size={18} /> Novo Barbeiro
          </Button>
        </div>

        <Card>
          <div className="p-6">
            {isLoading ? (
              <p className="text-zinc-400">Carregando equipe...</p>
            ) : employees.length === 0 ? (
              <div className="text-center py-10 text-zinc-500">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p>Nenhum barbeiro cadastrado.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {employees.map((employee: any) => (
                  <div key={employee.id} className="bg-zinc-800/50 rounded-xl p-5 border border-zinc-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-zinc-700 rounded-full flex items-center justify-center">
                          {employee.photo ? (
                            <img src={employee.photo} alt={employee.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-lg font-bold text-zinc-400">{employee.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-white">{employee.name}</h3>
                          <span className="text-xs text-zinc-500">{employee.role}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        employee.is_active_barber ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {employee.is_active_barber ? 'ATIVO' : 'INATIVO'}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4 text-sm text-zinc-400">
                      <p><span className="text-zinc-500">Email:</span> {employee.email}</p>
                      <p><span className="text-zinc-500">Comissão:</span> {employee.commission_rate ? `${employee.commission_rate}%` : 'Não definida'}</p>
                      <p className="flex items-center gap-1">
                        <Scissors size={14} className="text-amber-500" />
                        {employee.services.length} serviço(s)
                      </p>
                    </div>

                    <Button variant="secondary" className="w-full" onClick={() => openModal(employee)}>
                      Editar Perfil
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-zinc-900 rounded-2xl w-full max-w-lg p-6 border border-zinc-800 my-8">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingEmployee ? 'Editar Barbeiro' : 'Novo Barbeiro'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nome do Barbeiro"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
              <Input
                label="E-mail (para login)"
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
              <Input
                label={editingEmployee ? 'Nova Senha (opcional)' : 'Senha Inicial'}
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required={!editingEmployee}
              />
              <Input
                label="Comissão (%)"
                type="number"
                step="0.01"
                placeholder="Ex: 50"
                value={form.commission_rate}
                onChange={e => setForm({ ...form, commission_rate: e.target.value })}
              />
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Serviços Realizados</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-zinc-950 rounded-lg border border-zinc-800">
                  {services.map((s: any) => (
                    <label key={s.id} className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={form.service_ids.includes(s.id)}
                        onChange={() => toggleService(s.id)}
                        className="rounded bg-zinc-800 border-zinc-700 text-amber-500 focus:ring-amber-500"
                      />
                      {s.name}
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-zinc-300 mt-4 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={form.is_active_barber}
                  onChange={e => setForm({ ...form, is_active_barber: e.target.checked })}
                  className="rounded bg-zinc-800 border-zinc-700 text-emerald-500 focus:ring-emerald-500"
                />
                Ativo para agendamentos
              </label>

              {mutation.isError && (
                <p className="text-red-500 text-sm">{mutation.error.message}</p>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="ghost" className="flex-1" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" className="flex-1" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
