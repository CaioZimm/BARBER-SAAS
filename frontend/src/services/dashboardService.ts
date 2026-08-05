import api from '../lib/axios'
import type { DashboardStats } from '../interfaces'

export const dashboardService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get('/appointments/dashboard')
    return data
  }
}
