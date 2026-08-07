import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Phone, Mail, Pencil, Trash2, User, Calendar, Clock } from 'lucide-react'
import { customersService } from '../../services/customersService'
import DashboardLayout from '../../components/layout/DashboardLayout'
import type { Customer, CustomerFormData } from '../../interfaces'
import { Card } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { formatPhone, applyPhoneMask } from '../../utils'
import { format, parseISO } from 'date-fns'

const emptyForm: CustomerFormData = { name: '', phone: '', email: '', notes: '' }

export default function CustomersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'frequent' | 'recent' | 'dormant'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [detailsCustomer, setDetailsCustomer] = useState<Customer | null>(null)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [form, setForm] = useState<CustomerFormData>(emptyForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ['customers', search, filter],
    queryFn: () => customersService.getCustomers(search, filter !== 'all' ? filter : undefined),
  })

  const saveMutation = useMutation({
    mutationFn: (data: CustomerFormData) =>
      editing
        ? customersService.updateCustomer(editing.id, data)
        : customersService.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      setModalOpen(false)
      setForm(emptyForm)
      setEditing(null)
      // If we edited from details view, refresh the details view with new data
      if (detailsCustomer && editing) {
        setDetailsCustomer({ ...detailsCustomer, ...form })
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customersService.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      setDeleteId(null)
      setDetailsCustomer(null)
    },
  })

  const openEdit = (c: Customer, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setEditing(c)
    setForm({ name: c.name, phone: c.phone, email: c.email || '', notes: c.notes || '' })
    setModalOpen(true)
  }

  const openNew = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Clientes</h1>
            <p className="text-zinc-400 text-sm mt-1">{customers.length} cliente(s) listado(s)</p>
          </div>
          <Button onClick={openNew}>
            <Plus size={16} />
            Novo cliente
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
          <Input
            id="search-customers"
            placeholder="Buscar por nome ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={16} />}
            className="w-full xl:max-w-sm"
          />
          <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800 overflow-x-auto w-full xl:w-auto shrink-0">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'frequent', label: 'Mais Frequentes' },
              { id: 'recent', label: 'Recentes' },
              { id: 'dormant', label: 'Inativos (+30d)' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors flex-1 xl:flex-none ${filter === f.id ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : customers.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <User size={48} className="text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-400 font-medium">Nenhum cliente encontrado</p>
              <p className="text-zinc-600 text-sm mt-1">Nenhum registro corresponde aos filtros atuais.</p>
              <Button className="mt-4" onClick={openNew}>
                <Plus size={16} /> Adicionar cliente
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {customers.map((c) => (
              <Card key={c.id} className="space-y-3 cursor-pointer hover:border-zinc-700 transition-colors" onClick={() => setDetailsCustomer(c)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {c.user?.photo ? (
                      <img src={c.user.photo} alt={c.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-white flex items-center gap-2">
                        {c.name}
                        {c.user_id && <User size={12} className="text-amber-500" title="Cliente do App" />}
                      </p>
                      <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                        <Phone size={11} /> {formatPhone(c.phone)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => openEdit(c, e)}
                      className="p-1.5 text-zinc-500 hover:text-amber-400 hover:bg-zinc-800 rounded-md transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteId(c.id); }}
                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-md transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {c.email && (
                  <p className="text-xs text-zinc-500 flex items-center gap-1">
                    <Mail size={11} /> {c.email}
                  </p>
                )}
                <div className="pt-2 flex items-center gap-4 border-t border-zinc-800/50 mt-2">
                  <div className="text-xs text-zinc-400">
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Visitas</span>
                    {c.total_appointments || 0}
                  </div>
                  <div className="text-xs text-zinc-400">
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Última Vez</span>
                    {c.last_visit ? format(parseISO(c.last_visit), "dd/MM/yyyy") : '-'}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Customer Details Modal */}
        <Modal isOpen={!!detailsCustomer} onClose={() => setDetailsCustomer(null)} title="Informações do Cliente">
          {detailsCustomer && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                {detailsCustomer.user?.photo ? (
                  <img src={detailsCustomer.user.photo} alt={detailsCustomer.name} className="w-16 h-16 rounded-full object-cover shrink-0 border border-amber-500/20" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xl shrink-0 border border-amber-500/20">
                    {detailsCustomer.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {detailsCustomer.name}
                    {detailsCustomer.user_id && (
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-500/20 text-amber-400">
                        Cliente
                      </span>
                    )}
                  </h3>
                  <div className="flex flex-col gap-1 mt-1">
                    <p className="text-sm text-zinc-400 flex items-center gap-2"><Phone size={14} /> {formatPhone(detailsCustomer.phone)}</p>
                    {detailsCustomer.email && (
                      <p className="text-sm text-zinc-400 flex items-center gap-2"><Mail size={14} /> {detailsCustomer.email}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                  <div className="flex items-center gap-2 text-zinc-400 mb-1">
                    <Calendar size={14} />
                    <span className="text-xs font-semibold uppercase">Total Agendado</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{detailsCustomer.total_appointments || 0}</p>
                </div>
                <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                  <div className="flex items-center gap-2 text-zinc-400 mb-1">
                    <Clock size={14} />
                    <span className="text-xs font-semibold uppercase">Última Visita</span>
                  </div>
                  <p className="text-lg font-bold text-white">
                    {detailsCustomer.last_visit ? format(parseISO(detailsCustomer.last_visit), "dd/MM/yyyy") : 'Nunca'}
                  </p>
                </div>
              </div>

              {detailsCustomer.notes && (
                <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                  <h4 className="text-xs font-semibold uppercase text-zinc-400 mb-2">Observações Locais</h4>
                  <p className="text-sm text-zinc-300">{detailsCustomer.notes}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button className="flex-1" variant="secondary" onClick={() => openEdit(detailsCustomer)}>
                  <Pencil size={16} /> Editar Cadastro
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Form Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar cliente' : 'Novo cliente'}>
          <div className="space-y-4">
            {editing?.user_id && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex gap-3 text-sm text-amber-400 mb-4">
                <User size={16} className="mt-0.5 shrink-0" />
                <p>Este cliente possui conta no app. Os dados pessoais são gerenciados por ele mesmo.</p>
              </div>
            )}

            <Input
              id="c-name"
              label="Nome *"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              disabled={!!editing?.user_id}
              className={editing?.user_id ? "opacity-50 cursor-not-allowed" : ""}
            />
            <Input
              id="c-phone"
              label="Telefone / WhatsApp *"
              placeholder="(11) 99999-9999"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: applyPhoneMask(e.target.value) }))}
              disabled={!!editing?.user_id}
              className={editing?.user_id ? "opacity-50 cursor-not-allowed" : ""}
            />
            <Input
              id="c-email"
              type="email"
              label="Email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              disabled={!!editing?.user_id}
              className={editing?.user_id ? "opacity-50 cursor-not-allowed" : ""}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-300">Observações Locais</label>
              <textarea
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                rows={3}
                placeholder="Preferências, alergias, restrições..."
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
            {saveMutation.error && (
              <p className="text-sm text-red-400">{(saveMutation.error as any)?.response?.data?.error}</p>
            )}
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button className="flex-1" isLoading={saveMutation.isPending} onClick={() => saveMutation.mutate(form)}>
                {editing ? 'Salvar' : 'Cadastrar'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirm */}
        <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirmar exclusão" size="sm">
          <div className="space-y-4">
            <p className="text-zinc-300 text-sm">Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita e removerá todo o histórico dele.</p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setDeleteId(null)}>Cancelar</Button>
              <Button variant="danger" className="flex-1" isLoading={deleteMutation.isPending} onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
                Excluir
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
