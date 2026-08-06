import type { WorkingHour, BlockedSchedule } from '../interfaces'
import api from '../lib/axios'

export const scheduleService = {
  getWorkingHours: async (): Promise<WorkingHour[]> => {
    const { data } = await api.get('/schedule/working-hours')
    return data
  },
  updateWorkingHours: async (payload: { dayOfWeek: number; startTime: string; endTime: string; lunchStart?: string; lunchEnd?: string; active: boolean }): Promise<WorkingHour> => {
    const { data } = await api.put('/schedule/working-hours', payload)
    return data
  },
  getBlockedTimes: async (): Promise<BlockedSchedule[]> => {
    const { data } = await api.get('/schedule/blocked')
    return data
  },
  createBlockedTime: async (payload: { startDate: string; endDate: string; reason?: string }): Promise<BlockedSchedule> => {
    const { data } = await api.post('/schedule/blocked', payload)
    return data
  },
  deleteBlockedTime: async (id: string): Promise<void> => {
    await api.delete(`/schedule/blocked/${id}`)
  }
}