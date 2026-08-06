import type { Service, ServiceFormData } from '../interfaces'
import api from '../lib/axios'

export const barberServicesService = {
  getServices: async (): Promise<Service[]> => {
    const { data } = await api.get('/services')
    return data
  },
  createService: async (payload: ServiceFormData): Promise<Service> => {
    const { data } = await api.post('/services', payload)
    return data
  },
  updateService: async (id: string, payload: ServiceFormData): Promise<Service> => {
    const { data } = await api.patch(`/services/${id}`, payload)
    return data
  },
  toggleServiceStatus: async (id: string, active: boolean): Promise<Service> => {
    const { data } = await api.patch(`/services/${id}`, { active })
    return data
  },
  deleteService: async (id: string): Promise<void> => {
    await api.delete(`/services/${id}`)
  }
}