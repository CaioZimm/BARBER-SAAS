import api from '../lib/axios'

export const subscriptionService = {
  getMySubscription: async () => {
    const { data } = await api.get('/subscriptions/me')
    return data
  },
  simulateSubscribe: async (plan_id: string) => {
    const { data } = await api.post('/subscriptions/simulate', { plan_id })
    return data
  }
}