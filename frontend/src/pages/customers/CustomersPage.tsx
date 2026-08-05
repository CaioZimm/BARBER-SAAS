import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Phone, Mail, Pencil, Trash2, User } from 'lucide-react'
import { customersService } from '../../services/customersService'
import DashboardLayout from '../../components/layout/DashboardLayout'
import type { Customer, CustomerFormData } from '../../interfaces'
import { Card } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { formatPhone } from '../../utils'

const emptyForm: CustomerFormData = { name: '', phone: '', email: '', notes: '' }

export default function CustomersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [form, setForm] = useState<CustomerFormData>(emptyForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ['customers', search],
    queryFn: () => customersService.getCustomers(search),
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
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customersService.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      setDeleteId(null)
    },
  })

  const openEdit = (c: Customer) => {
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
            <p className="text-zinc-400 text-sm mt-1">{customers.length} cliente(s) cadastrado(s)</p>
          </div>
          <Button onClick={openNew}>
            <Plus size={16} />
            Novo cliente
          </Button>
        </div>

        {/* Search */}
        <Input
          id="search-customers"
          placeholder="Buscar por nome ou telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search size={16} />}
          className="max-w-sm"
        />

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
              <p className="text-zinc-600 text-sm mt-1">Comece adicionando seu primeiro cliente</p>
              <Button className="mt-4" onClick={openNew}>
                <Plus size={16} /> Adicionar cliente
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {customers.map((c) => (
              <Card key={c.id} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{c.name}</p>
                      <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                        <Phone size={11} /> {formatPhone(c.phone)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(c)}
                      className="p-1.5 text-zinc-500 hover:text-amber-400 hover:bg-zinc-800 rounded-md transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteId(c.id)}
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
                {c.notes && (
                  <p className="text-xs text-zinc-500 bg-zinc-800 rounded-md px-2 py-1 line-clamp-2">
                    {c.notes}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Form Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar cliente' : 'Novo cliente'}>
          <div className="space-y-4">
            <Input id="c-name" label="Nome *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input id="c-phone" label="Telefone / WhatsApp *" placeholder="(11) 99999-9999" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            <Input id="c-email" type="email" label="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-300">Observações</label>
              <textarea
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                rows={3}
                placeholder="Preferências, alergias, etc."
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
            <p className="text-zinc-300 text-sm">Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.</p>
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
