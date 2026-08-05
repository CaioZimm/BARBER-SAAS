import api from '../lib/axios'
import type { Appointment } from '../interfaces'

export const appointmentsService = {
  getAppointments: async (date?: string): Promise<Appointment[]> => {
    const { data } = await api.get('/appointments', { params: { date } })
    return data
  },
  createAppointment: async (payload: { customerId: string; serviceId: string; startDate: string }): Promise<Appointment> => {
    const { data } = await api.post('/appointments', payload)
    return data
  },
  updateStatus: async (id: string, status: string): Promise<Appointment> => {
    const { data } = await api.patch(`/appointments/${id}`, { status })
    return data
  },
  cancelAppointment: async (id: string): Promise<void> => {
    await api.delete(`/appointments/${id}/cancel`)
  },
  getPublicSlots: async (slug: string, date: string): Promise<string[]> => {
    const { data } = await api.get(`/appointments/public/${slug}/slots`, { params: { date } })
    return data
  },
  bookPublicAppointment: async (slug: string, payload: { name: string; phone: string; serviceId: string; startDate: string }): Promise<void> => {
    await api.post(`/appointments/public/${slug}/book`, payload)
  }
}
