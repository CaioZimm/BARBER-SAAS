import api from '../lib/axios'
import type { Customer, CustomerFormData } from '../interfaces'

export const customersService = {
  getCustomers: async (search: string = ''): Promise<Customer[]> => {
    const { data } = await api.get('/customers', { params: { search } })
    return data
  },
  createCustomer: async (payload: CustomerFormData): Promise<Customer> => {
    const { data } = await api.post('/customers', payload)
    return data
  },
  updateCustomer: async (id: string, payload: CustomerFormData): Promise<Customer> => {
    const { data } = await api.patch(`/customers/${id}`, payload)
    return data
  },
  deleteCustomer: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`)
  }
}
