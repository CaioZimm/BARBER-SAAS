import api from '../lib/axios'

export const employeeService = {
  list: async () => {
    const { data } = await api.get('/employees')
    return data
  },
  create: async (payload: any) => {
    const { data } = await api.post('/employees', payload)
    return data
  },
  update: async (id: string, payload: any) => {
    const { data } = await api.put(`/employees/${id}`, payload)
    return data
  },
}