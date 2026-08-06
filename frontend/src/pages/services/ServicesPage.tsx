import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Scissors, Clock, DollarSign, Pencil, Trash2, ToggleLeft, ToggleRight, X, Loader2 } from 'lucide-react'
import { barberServicesService } from '../../services/barberServicesService'
import type { Service, ServiceFormData } from '../../interfaces'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Card } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { formatCurrency } from '../../utils'
import api from '../../lib/axios'

const emptyForm: ServiceFormData = { name: '', price: '', duration: '30', photos: [], active: true }

export default function ServicesPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState<ServiceFormData>(emptyForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: () => barberServicesService.getServices(),
  })

  const saveMutation = useMutation({
    mutationFn: (payload: ServiceFormData) =>
      editing
        ? barberServicesService.updateService(editing.id, payload)
        : barberServicesService.createService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      setModalOpen(false)
      setForm(emptyForm)
      setEditing(null)
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (s: Service) => barberServicesService.toggleServiceStatus(s.id, !s.active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => barberServicesService.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      setDeleteId(null)
    },
  })

  const openEdit = (s: Service) => {
    setEditing(s)
    setForm({ name: s.name, price: s.price.toString(), duration: s.duration.toString(), photos: s.photos || [], active: s.active })
    setModalOpen(true)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    setIsUploading(true)
    try {
      const urls: string[] = []
      for (let i = 0; i < e.target.files.length; i++) {
        const formData = new FormData()
        formData.append('file', e.target.files[i])
        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        urls.push(res.data.url)
      }
      setForm(f => ({ ...f, photos: [...(f.photos || []), ...urls] }))
    } catch (err) {
      alert('Erro ao enviar imagens.')
    } finally {
      setIsUploading(false)
      if (e.target) e.target.value = ''
    }
  }

  const removePhoto = (index: number) => {
    setForm(f => ({
      ...f,
      photos: (f.photos || []).filter((_, i) => i !== index)
    }))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Serviços</h1>
            <p className="text-zinc-400 text-sm mt-1">{services.length} serviço(s) cadastrado(s)</p>
          </div>
          <Button onClick={() => { setEditing(null); setForm(emptyForm); setModalOpen(true) }}>
            <Plus size={16} /> Novo serviço
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : services.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Scissors size={48} className="text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-400 font-medium">Nenhum serviço cadastrado</p>
              <Button className="mt-4" onClick={() => setModalOpen(true)}>
                <Plus size={16} /> Adicionar serviço
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {services.map((s) => (
              <Card key={s.id} className={!s.active ? 'opacity-60' : ''}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {s.photos && s.photos.length > 0 ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative group">
                        <img src={s.photos[0]} alt={s.name} className="w-full h-full object-cover" />
                        {s.photos.length > 1 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs font-bold text-white">
                            +{s.photos.length - 1}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
                        <Scissors size={18} />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-white">{s.name}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${s.active ? 'bg-green-500/10 text-green-400' : 'bg-zinc-700 text-zinc-500'}`}>
                        {s.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => toggleMutation.mutate(s)} className="p-1.5 text-zinc-500 hover:text-amber-400 hover:bg-zinc-800 rounded-md transition-colors">
                      {s.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    </button>
                    <button onClick={() => openEdit(s)} className="p-1.5 text-zinc-500 hover:text-amber-400 hover:bg-zinc-800 rounded-md transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleteId(s.id)} className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-md transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-green-400">
                    <DollarSign size={14} />
                    <span className="font-semibold">{formatCurrency(Number(s.price))}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Clock size={14} />
                    <span>{s.duration} min</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar serviço' : 'Novo serviço'}>
          <div className="space-y-4">
            <Input id="s-name" label="Nome do serviço *" placeholder="Ex: Corte + Barba" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <div className="grid grid-cols-2 gap-4">
              <Input id="s-price" type="number" label="Preço (R$) *" placeholder="0.00" min="0" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
              <Input id="s-duration" type="number" label="Duração (min) *" placeholder="30" min="5" step="5" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 block">Galeria de Fotos</label>

              <div className="flex flex-wrap gap-3 mb-3">
                {form.photos?.map((photo, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-zinc-700 group">
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center text-zinc-300 hover:text-white hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100">
                      <X size={14} />
                    </button>
                  </div>
                ))}

                <label className="w-20 h-20 rounded-lg border-2 border-dashed border-zinc-700 hover:border-amber-500/50 hover:bg-amber-500/5 flex flex-col items-center justify-center cursor-pointer transition-colors text-zinc-500 hover:text-amber-500">
                  {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Plus size={24} />}
                  <input type="file" multiple accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                </label>
              </div>
              <p className="text-xs text-zinc-500">Adicione imagens para mostrar o resultado deste serviço aos clientes.</p>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="s-active" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="w-4 h-4 accent-amber-500" />
              <label htmlFor="s-active" className="text-sm text-zinc-300">Serviço ativo (disponível para agendamento)</label>
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

        <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirmar exclusão" size="sm">
          <div className="space-y-4">
            <p className="text-zinc-300 text-sm">Tem certeza que deseja excluir este serviço?</p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setDeleteId(null)}>Cancelar</Button>
              <Button variant="danger" className="flex-1" isLoading={deleteMutation.isPending} onClick={() => deleteId && deleteMutation.mutate(deleteId)}>Excluir</Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
