import api from '../lib/axios'
import type { Barbershop } from '../interfaces'

export const publicService = {
  getBarbershops: async (search: string = ''): Promise<Barbershop[]> => {
    const { data } = await api.get('/public/barbershops', { params: search ? { search } : {} })
    return data
  },
  getBarbershopBySlug: async (slug: string): Promise<Barbershop> => {
    const { data } = await api.get(`/public/barbershops/${slug}`)
    return data
  }
}
