import type { Tenant } from '../interfaces'
import api from '../lib/axios'

export const tenantService = {
  getTenant: async (): Promise<Tenant> => {
    const { data } = await api.get('/tenant')
    return data
  },
  updateTenant: async (payload: { name: string; slug: string; logo?: string; photos?: string[]; description?: string; phone?: string; address?: string }): Promise<Tenant> => {
    const { data } = await api.put('/tenant', payload)
    return data
  }
}