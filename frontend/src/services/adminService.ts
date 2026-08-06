import api from '../lib/axios'

export const adminService = {
  getStats: async () => {
    const { data } = await api.get('/admin/stats')
    return data
  },
  getTenants: async () => {
    const { data } = await api.get('/admin/tenants')
    return data
  },
  getPlans: async () => {
    const { data } = await api.get('/admin/plans')
    return data
  },
  createPlan: async (payload: any) => {
    const { data } = await api.post('/admin/plans', payload)
    return data
  },
  updatePlan: async (id: string, payload: any) => {
    const { data } = await api.put(`/admin/plans/${id}`, payload)
    return data
  }
}
