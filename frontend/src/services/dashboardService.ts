import type { DashboardStats } from '../interfaces'
import api from '../lib/axios'

export const dashboardService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get('/appointments/dashboard')
    return data
  }
}