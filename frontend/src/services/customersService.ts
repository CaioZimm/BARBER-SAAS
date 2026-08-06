import type { Customer, CustomerFormData } from '../interfaces'
import api from '../lib/axios'

export const customersService = {
  getCustomers: async (search?: string, filter?: string): Promise<Customer[]> => {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (filter) params.append('filter', filter)
    const { data } = await api.get('/customers?' + params.toString())
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